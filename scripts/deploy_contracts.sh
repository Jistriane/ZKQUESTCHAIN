#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

cd "$ROOT_DIR/contracts"

if ! command -v soroban >/dev/null 2>&1; then
  echo "soroban CLI não encontrado. Instale antes de continuar." >&2
  exit 1
fi

echo "Deploy placeholder: ajuste comandos conforme sua configuração." >&2

echo "Exemplo (Futurenet):"
cat <<'EOF'
# soroban network add futurenet --rpc-url https://rpc-futurenet.stellar.org --network-passphrase "Test SDF Future Network ; October 2022"
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm --network futurenet --source <SEU_SEED>
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/player_registry.wasm --network futurenet --source <SEU_SEED>
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/achievement_nft.wasm --network futurenet --source <SEU_SEED>
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/ultrahonk_verifier.wasm --network futurenet --source <SEU_SEED>
EOF
