export const isSolved = (grid: number[][]): boolean => {
  if (grid.length !== 9) return false;
  const isValidGroup = (arr: number[]) => {
    const set = new Set<number>();
    for (const v of arr) {
      if (v < 1 || v > 9) return false;
      if (set.has(v)) return false;
      set.add(v);
    }
    return true;
  };

  for (let i = 0; i < 9; i += 1) {
    if (!isValidGroup(grid[i])) return false;
  }

  for (let j = 0; j < 9; j += 1) {
    const col = grid.map((row) => row[j]);
    if (!isValidGroup(col)) return false;
  }

  for (let br = 0; br < 3; br += 1) {
    for (let bc = 0; bc < 3; bc += 1) {
      const box: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          box.push(grid[br * 3 + i][bc * 3 + j]);
        }
      }
      if (!isValidGroup(box)) return false;
    }
  }

  return true;
};

export const hasEmptyCells = (grid: number[][]): boolean => {
  return grid.some((row) => row.some((cell) => cell === 0));
};
