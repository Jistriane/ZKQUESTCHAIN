#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

cd "$ROOT_DIR/circuits/sudoku"

if ! command -v nargo >/dev/null 2>&1; then
  echo "nargo não encontrado. Instale Noir antes de continuar." >&2
  exit 1
fi

nargo compile

JSON_PATH="$ROOT_DIR/circuits/sudoku/target/sudoku.json"
if [[ ! -f "$JSON_PATH" ]]; then
  echo "Arquivo sudoku.json não encontrado em target/." >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/frontend/public/circuits/sudoku"

python3 - <<'PY'
import base64, gzip, json, sys
from pathlib import Path

json_path = Path("/home/jistriane/Documentos/zkQuestChain/circuits/sudoku/target/sudoku.json")
out_path = Path("/home/jistriane/Documentos/zkQuestChain/frontend/public/circuits/sudoku/circuit.acir")

data = json.loads(json_path.read_text())
bytecode_b64 = data.get("bytecode")
if not bytecode_b64:
    print("bytecode não encontrado no sudoku.json", file=sys.stderr)
    sys.exit(1)

compressed = base64.b64decode(bytecode_b64)
acir = gzip.decompress(compressed)
out_path.write_bytes(acir)

print(f"ACIR escrito em {out_path}")
PY
