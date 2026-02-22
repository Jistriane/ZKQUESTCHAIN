import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { CompiledCircuit } from '@noir-lang/types';

export type ProofPayload = {
  proof: Uint8Array;
  publicInputs: Uint8Array;
};

export type SudokuInputs = {
  solution: number[][];
  puzzle: number[][];
  puzzleHash: string;
};

const loadCircuit = async (): Promise<CompiledCircuit> => {
  const response = await fetch('/circuits/sudoku/sudoku.json');
  if (!response.ok) throw new Error('Circuit JSON not found');
  const circuit: CompiledCircuit = await response.json();
  return circuit;
};

export const generateSudokuProof = async (inputs: SudokuInputs): Promise<ProofPayload> => {
  const demoMode = (import.meta.env.VITE_DEMO_MODE as string | undefined) === 'true';
  
  try {
    const circuit = await loadCircuit();
    
    // Initialize backend with compiled circuit
    const backend = new BarretenbergBackend(circuit);
    
    // Create Noir instance
    const noir = new Noir(circuit);

    // Convert inputs to Noir format
    const noirInputs = {
      solution: inputs.solution,
      puzzle: inputs.puzzle,
      puzzle_hash: inputs.puzzleHash,
    };

    // Generate witness from inputs
    const { witness } = await noir.execute(noirInputs);

    // Generate proof using backend
    const { proof, publicInputs } = await backend.generateProof(witness);
    
    return { 
      proof: proof, 
      publicInputs: publicInputs || new Uint8Array() 
    };
  } catch (error: any) {
    console.error('Proof generation error:', error);
    if (!demoMode) throw error;
    // Fallback to simulated proof on error
    console.log('Falling back to simulated proof due to version incompatibility');
    const proof = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const publicInputs = new Uint8Array([0]);
    return { proof, publicInputs };
  }
};

const extractPublicInputs = (witness: Uint8Array, circuit: any): Uint8Array => {
  const count = circuit?.abi?.public_inputs?.length ?? 0;
  if (count === 0) return new Uint8Array();
  const start = 1;
  const size = count * 32;
  return witness.slice(start, start + size);
};
