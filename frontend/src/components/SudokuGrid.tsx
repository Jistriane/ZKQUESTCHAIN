type Props = {
  puzzle: number[][];
  solution: number[][];
  onChange: (row: number, col: number, value: number) => void;
};

export const SudokuGrid = ({ puzzle, solution, onChange }: Props) => {
  return (
    <div className="grid grid-cols-9 gap-1 rounded-xl bg-slate-950 p-3">
      {solution.map((row, i) =>
        row.map((cell, j) => {
          const isFixed = puzzle[i][j] !== 0;
          return (
            <input
              key={`${i}-${j}`}
              type="number"
              min="1"
              max="9"
              value={cell === 0 ? '' : cell}
              disabled={isFixed}
              aria-label={`Sudoku cell row ${i + 1} column ${j + 1}`}
              onChange={(e) => {
                const val = e.target.value;
                const num = val === '' ? 0 : parseInt(val, 10);
                if (!isNaN(num) && num >= 0 && num <= 9) {
                  onChange(i, j, num);
                }
              }}
              className={`h-10 w-10 appearance-none rounded-md text-center text-sm font-semibold text-slate-100 outline-none ${
                isFixed
                  ? 'bg-slate-800 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 focus:ring-2 focus:ring-purple-500 cursor-pointer'
              }`}
            />
          );
        })
      )}
    </div>
  );
};
