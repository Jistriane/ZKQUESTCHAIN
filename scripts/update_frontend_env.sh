#!/usr/bin/env bash
set -euo pipefail

# Script para atualizar frontend/.env com IDs dos contratos

if [ $# -ne 4 ]; then
    echo "Uso: $0 <QUEST_MANAGER_ID> <PLAYER_REGISTRY_ID> <ACHIEVEMENT_NFT_ID> <VERIFIER_ID>"
    exit 1
fi

QUEST_MANAGER_ID=$1
PLAYER_REGISTRY_ID=$2
ACHIEVEMENT_NFT_ID=$3
VERIFIER_ID=$4

ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../frontend" && pwd)/.env"

echo "Atualizando $ENV_FILE..."

# Criar backup
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Atualizar valores
sed -i "s|^VITE_CONTRACT_QUEST_MANAGER=.*|VITE_CONTRACT_QUEST_MANAGER=$QUEST_MANAGER_ID|" "$ENV_FILE"
sed -i "s|^VITE_CONTRACT_PLAYER_REGISTRY=.*|VITE_CONTRACT_PLAYER_REGISTRY=$PLAYER_REGISTRY_ID|" "$ENV_FILE"
sed -i "s|^VITE_CONTRACT_ACHIEVEMENT_NFT=.*|VITE_CONTRACT_ACHIEVEMENT_NFT=$ACHIEVEMENT_NFT_ID|" "$ENV_FILE"
sed -i "s|^VITE_CONTRACT_ULTRAHONK=.*|VITE_CONTRACT_ULTRAHONK=$VERIFIER_ID|" "$ENV_FILE"

# Desabilitar modo demo
sed -i "s|^VITE_DEMO_MODE=.*|VITE_DEMO_MODE=false|" "$ENV_FILE"

# Configurar Testnet
sed -i "s|^VITE_STELLAR_NETWORK=.*|VITE_STELLAR_NETWORK=TESTNET|" "$ENV_FILE"

echo "✓ .env atualizado!"
echo ""
echo "Valores configurados:"
grep "^VITE_CONTRACT_" "$ENV_FILE"
grep "^VITE_DEMO_MODE" "$ENV_FILE"
grep "^VITE_STELLAR_NETWORK" "$ENV_FILE"
echo ""
echo "Backup salvo em: $ENV_FILE.backup.*"
