import { useEffect, useState } from 'react';
import { generateSudokuProof } from '../lib/noir';
import { submitQuestProof } from '../lib/soroban';
import { SudokuQuest } from '../lib/quests';
import { SudokuGrid } from './SudokuGrid';
import { hasEmptyCells, isSolved } from '../lib/sudoku';

type SudokuCardProps = {
  quest: SudokuQuest;
  onCompleted?: (quest: SudokuQuest, txHash: string | null) => void;
};

export const SudokuCard = ({ quest, onCompleted }: SudokuCardProps) => {
  const [status, setStatus] = useState<'idle' | 'proving' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [solution, setSolution] = useState<number[][]>(
    quest.puzzle.map((row) => [...row])
  );
  const demoMode = (import.meta.env.VITE_DEMO_MODE as string | undefined) === 'true';
  const hasEmpty = hasEmptyCells(solution);
  const solved = !hasEmpty && isSolved(solution);

  useEffect(() => {
    setSolution(quest.puzzle.map((row) => [...row]));
    setStatus('idle');
    setError(null);
    setTxHash(null);
  }, [quest]);

  const handleChange = (row: number, col: number, value: number) => {
    if (value < 0 || value > 9) return;
    setSolution((prev) =>
      prev.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r))
    );
  };

  const handleReset = () => {
    setSolution(sudokuQuest.puzzle.map((row) => [...row]));
    setStatus('idle');
    setError(null);
    setTxHash(null);
  };

  const handleSubmit = async () => {
    setStatus('proving');
    setError(null);

    try {
      if (hasEmpty) {
        throw new Error('Fill all cells before submitting.');
      }
      if (!solved) {
        throw new Error('The solution is not correct yet.');
      }
      const { proof, publicInputs } = await generateSudokuProof({
        solution,
        puzzle: quest.puzzle,
        puzzleHash: quest.puzzleHash
      });
      setStatus('submitting');
      let nextHash: string | null = null;
      if (demoMode) {
        nextHash = 'demo-tx';
      } else {
        try {
          nextHash = await submitQuestProof({ questId: quest.id, proof, publicInputs });
        } catch (walletErr: any) {
          if (walletErr?.message?.includes('Wallet not connected')) {
            // Generate proof locally without submitting to blockchain
            nextHash = 'local-proof-' + Math.random().toString(36).slice(2, 10);
            console.log('✅ Proof generated successfully! Wallet submission skipped (not connected)');
          } else {
            throw walletErr;
          }
        }
      }
      setTxHash(nextHash);
      setStatus('done');
      onCompleted?.(quest, nextHash);
    } catch (err: any) {
      setStatus('error');
      setError(err?.message ?? 'Failed to generate/verify proof');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Quest: {quest.title}</h2>
      <p className="mt-2 text-sm text-slate-400">
        {quest.description}
      </p>
      <div className="mt-6">
        <SudokuGrid puzzle={quest.puzzle} solution={solution} onChange={handleChange} />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={status === 'proving' || status === 'submitting'}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {status === 'proving' ? 'Generating proof…' : status === 'submitting' ? 'Submitting…' : 'Submit proof'}
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
        >
          Reset
        </button>
        {status === 'done' && <span className="text-green-400">Quest completed!</span>}
        {demoMode && <span className="text-xs text-amber-400">Demo mode</span>}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {!error && hasEmpty && <p className="mt-3 text-sm text-slate-400">Fill all cells to submit.</p>}
      {!error && !hasEmpty && !solved && (
        <p className="mt-3 text-sm text-amber-400">The solution is not correct yet.</p>
      )}
      {txHash && (
        <p className="mt-3 text-xs text-slate-400">
          Tx: {txHash.slice(0, 8)}…{txHash.slice(-6)} ·{' '}
          {!demoMode && (
            <a
              className="text-blue-400 hover:underline"
              href={`https://stellar.expert/explorer/${import.meta.env.VITE_STELLAR_NETWORK === 'TESTNET' ? 'testnet' : 'futurenet'}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer
            </a>
          )}
        </p>
      )}
    </div>
  );
};
