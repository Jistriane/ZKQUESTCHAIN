use dep::std;

fn main(
    solution: [[u8; 9]; 9],
    puzzle: pub [[u8; 9]; 9],
    puzzle_hash: pub Field,
) {
    if puzzle_hash != 0 {
        let computed_hash = hash_puzzle(puzzle);
        assert(computed_hash == puzzle_hash);
    }

    for i in 0..9 {
        for j in 0..9 {
            if puzzle[i][j] != 0 {
                assert(solution[i][j] == puzzle[i][j]);
            }
        }
    }

    for i in 0..9 {
        assert(is_valid_row(solution[i]));
    }

    for j in 0..9 {
        let mut col: [u8; 9] = [0; 9];
        for i in 0..9 {
            col[i] = solution[i][j];
        }
        assert(is_valid_row(col));
    }

    for box_row in 0..3 {
        for box_col in 0..3 {
            let mut box_vals: [u8; 9] = [0; 9];
            let mut idx = 0;
            for i in 0..3 {
                for j in 0..3 {
                    box_vals[idx] = solution[box_row * 3 + i][box_col * 3 + j];
                    idx += 1;
                }
            }
            assert(is_valid_row(box_vals));
        }
    }
}

fn is_valid_row(row: [u8; 9]) -> bool {
    let mut seen: [bool; 9] = [false; 9];
    for i in 0..9 {
        let val = row[i];
        assert(val >= 1 & val <= 9);
        let idx = (val - 1) as u32;
        assert(!seen[idx]);
        seen[idx] = true;
    }
    true
}

fn hash_puzzle(puzzle: [[u8; 9]; 9]) -> Field {
    let mut values: [Field; 81] = [0; 81];
    let mut idx = 0;
    for i in 0..9 {
        for j in 0..9 {
            values[idx] = puzzle[i][j] as Field;
            idx += 1;
        }
    }
    std::hash::pedersen_hash(values)
}

#[test]
fn test_valid_row() {
    let row: [u8; 9] = [1,2,3,4,5,6,7,8,9];
    assert(is_valid_row(row));
}
