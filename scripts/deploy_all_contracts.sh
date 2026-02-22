#!/usr/bin/env bash
set -euo pipefail

# zkQuestChain - Script de Deploy Automatizado
# Este script faz o deploy completo de todos os contratos na Testnet

echo "=================================================="
echo "zkQuestChain MVP - Deploy Automatizado"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se soroban está instalado
if ! command -v soroban &> /dev/null; then
    echo -e "${RED}ERRO: Soroban CLI não encontrado!${NC}"
    echo ""
    echo "Instale com:"
    echo "  curl --proto '=https' --tlsv1.2 -sSf https://install.stellar.org | bash"
    echo "  source ~/.bashrc"
    exit 1
fi

echo -e "${GREEN}✓${NC} Soroban CLI encontrado: $(soroban --version)"

# Verificar autenticação
if [ -z "${SOROBAN_SECRET_KEY:-}" ]; then
    echo -e "${YELLOW}AVISO: SOROBAN_SECRET_KEY não configurada.${NC}"
    echo "Usando identity 'default' do Soroban CLI..."
    SOURCE_OPTION="--source-account default"
else
    echo -e "${GREEN}✓${NC} SOROBAN_SECRET_KEY configurada"
    SOURCE_OPTION="--source $SOROBAN_SECRET_KEY"
fi

# Configurar rede
echo ""
echo "Configurando rede Testnet..."
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  2>/dev/null || true

echo -e "${GREEN}✓${NC} Rede Testnet configurada"

# Obter endereço do admin
echo ""
echo "Obtendo endereço do admin..."
ADMIN_ADDRESS=$(soroban keys address default 2>/dev/null || echo "")

if [ -z "$ADMIN_ADDRESS" ]; then
    echo -e "${YELLOW}AVISO: Não foi possível obter endereço. Gerando identity...${NC}"
    soroban keys generate default --network testnet
    ADMIN_ADDRESS=$(soroban keys address default)
fi

echo -e "${GREEN}✓${NC} Admin address: $ADMIN_ADDRESS"

# Diretório dos WASMs
WASM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../contracts/target/wasm32-unknown-unknown/release" && pwd)"

# Verificar se os WASMs existem
echo ""
echo "Verificando WASMs..."

REQUIRED_WASMS=(
    "ultrahonk_verifier.wasm"
    "player_registry.wasm"
    "achievement_nft.wasm"
    "quest_manager.wasm"
)

for wasm in "${REQUIRED_WASMS[@]}"; do
    if [ ! -f "$WASM_DIR/$wasm" ]; then
        echo -e "${RED}ERRO: $wasm não encontrado em $WASM_DIR${NC}"
        echo ""
        echo "Compile os contratos com:"
        echo "  cd contracts && cargo build --release --target wasm32-unknown-unknown"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $wasm encontrado"
done

# Função para fazer deploy
deploy_contract() {
    local name=$1
    local wasm_file=$2
    
    echo ""
    echo "Fazendo deploy de $name..."
    
    local contract_id
    contract_id=$(soroban contract deploy \
        --wasm "$WASM_DIR/$wasm_file" \
        --network testnet \
        $SOURCE_OPTION 2>&1)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Falha no deploy de $name"
        echo "$contract_id"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} $name deployed: $contract_id"
    echo "$contract_id"
}

# Deploy dos contratos na ordem correta
echo ""
echo "=================================================="
echo "Iniciando deploys..."
echo "=================================================="

# 1. UltraHonkVerifier (não tem dependências)
VERIFIER_ID=$(deploy_contract "UltraHonkVerifier" "ultrahonk_verifier.wasm")
[ $? -ne 0 ] && exit 1

# 2. PlayerRegistry (será inicializado depois)
PLAYER_REGISTRY_ID=$(deploy_contract "PlayerRegistry" "player_registry.wasm")
[ $? -ne 0 ] && exit 1

# 3. AchievementNFT (será inicializado depois)
ACHIEVEMENT_NFT_ID=$(deploy_contract "AchievementNFT" "achievement_nft.wasm")
[ $? -ne 0 ] && exit 1

# 4. QuestManager (depende dos outros 3)
QUEST_MANAGER_ID=$(deploy_contract "QuestManager" "quest_manager.wasm")
[ $? -ne 0 ] && exit 1

echo ""
echo "=================================================="
echo "Inicializando contratos..."
echo "=================================================="

# Inicializar QuestManager
echo ""
echo "Inicializando QuestManager..."
soroban contract invoke \
  --id "$QUEST_MANAGER_ID" \
  --network testnet \
  $SOURCE_OPTION \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --verifier_contract "$VERIFIER_ID" \
  --player_registry "$PLAYER_REGISTRY_ID" \
  --achievement_nft "$ACHIEVEMENT_NFT_ID"

[ $? -eq 0 ] && echo -e "${GREEN}✓${NC} QuestManager inicializado" || echo -e "${RED}✗${NC} Falha na inicialização"

# Inicializar PlayerRegistry
echo ""
echo "Inicializando PlayerRegistry..."
soroban contract invoke \
  --id "$PLAYER_REGISTRY_ID" \
  --network testnet \
  $SOURCE_OPTION \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --quest_manager "$QUEST_MANAGER_ID"

[ $? -eq 0 ] && echo -e "${GREEN}✓${NC} PlayerRegistry inicializado" || echo -e "${RED}✗${NC} Falha na inicialização"

# Inicializar AchievementNFT
echo ""
echo "Inicializando AchievementNFT..."
soroban contract invoke \
  --id "$ACHIEVEMENT_NFT_ID" \
  --network testnet \
  $SOURCE_OPTION \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --quest_manager "$QUEST_MANAGER_ID"

[ $? -eq 0 ] && echo -e "${GREEN}✓${NC} AchievementNFT inicializado" || echo -e "${RED}✗${NC} Falha na inicialização"

echo ""
echo "=================================================="
echo "Deploy completo!"
echo "=================================================="
echo ""
echo "IDs dos contratos:"
echo ""
echo "VITE_CONTRACT_QUEST_MANAGER=$QUEST_MANAGER_ID"
echo "VITE_CONTRACT_PLAYER_REGISTRY=$PLAYER_REGISTRY_ID"
echo "VITE_CONTRACT_ACHIEVEMENT_NFT=$ACHIEVEMENT_NFT_ID"
echo "VITE_CONTRACT_ULTRAHONK=$VERIFIER_ID"
echo ""
echo "Copie esses valores para frontend/.env"
echo ""
echo "Ou execute:"
echo "  ./scripts/update_frontend_env.sh \\"
echo "    \"$QUEST_MANAGER_ID\" \\"
echo "    \"$PLAYER_REGISTRY_ID\" \\"
echo "    \"$ACHIEVEMENT_NFT_ID\" \\"
echo "    \"$VERIFIER_ID\""
echo ""
