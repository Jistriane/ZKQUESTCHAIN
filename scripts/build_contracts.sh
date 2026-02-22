#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

cd "$ROOT_DIR/contracts"

if ! command -v soroban >/dev/null 2>&1; then
  echo "soroban CLI não encontrado. Instale antes de continuar." >&2
  exit 1
fi

soroban contract build
