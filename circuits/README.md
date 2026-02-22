# Circuits

- sudoku/ — Noir circuit for proving Sudoku solution.

## Testing

- Go to circuits/sudoku and run nargo test.

## Artifacts

- Generate the ACIR artifact with nargo compile.
- Copy the ACIR file to frontend/public/circuits/sudoku/circuit.acir.

## Note

- In the MVP, puzzle_hash = 0 disables puzzle commitment verification.
