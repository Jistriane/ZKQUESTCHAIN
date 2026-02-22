# Deployment Instructions - zkQuestChain MVP

## Current Status

✅ Noir circuit compiled (ACIR generated)
✅ Frontend functional in demo mode
⏳ Soroban contracts with compilation errors (cross-contract calls)
❌ Soroban CLI not installed (no internet)

## Pending Issues

### 1. Contract Compilation

**Error**: `invoke_contract` in Soroban SDK 22 requires `Vec<Val>` but automatic conversion doesn't work.

**Affected files**:
- `contracts/quest_manager/src/lib.rs` (lines 229, 250, 264)

**Possible Solutions**:
1. Use `contractclient!` macro to generate type-safe client
2. Manually implement `IntoVal` for each argument
3. Simplify for MVP by removing cross-contract calls (events only)

### 2. Soroban CLI Installation

**When you have internet**, run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://install.stellar.org | bash
source ~/.bashrc
```

## Manual Deployment (When Soroban CLI Is Installed)

### Step 1: Configure Network

```bash
soroban network add testnet \
  --rpc-url https://rpc-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Step 2: Configure Wallet

You provided the recovery phrase. To convert to secret key:

```bash
# NEVER SHARE THIS KEY
export SOROBAN_SECRET_KEY="<your_secret_key_here>"
```

### Step 3: Compile Contracts

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

### Step 4: Deploy Contracts

**4.1 Deploy UltraHonkVerifier**:
```bash
VERIFIER_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ultrahonk_verifier.wasm \
  --network testnet \
  --source $SOROBAN_SECRET_KEY)

echo "VERIFIER_ID=$VERIFIER_ID"
```

**4.2 Deploy PlayerRegistry**:
```bash
PLAYER_REGISTRY_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/player_registry.wasm \
  --network testnet \
  --source $SOROBAN_SECRET_KEY)

echo "PLAYER_REGISTRY_ID=$PLAYER_REGISTRY_ID"
```

**4.3 Deploy AchievementNFT**:
```bash
ACHIEVEMENT_NFT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/achievement_nft.wasm \
  --network testnet \
  --source $SOROBAN_SECRET_KEY)

echo "ACHIEVEMENT_NFT_ID=$ACHIEVEMENT_NFT_ID"
```

**4.4 Deploy QuestManager**:
```bash
QUEST_MANAGER_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm \
  --network testnet \
  --source $SOROBAN_SECRET_KEY)

echo "QUEST_MANAGER_ID=$QUEST_MANAGER_ID"
```

### Step 5: Initialize Contracts

**5.1 Get your public address**:
```bash
ADMIN_ADDRESS=$(soroban config identity address)
echo "ADMIN_ADDRESS=$ADMIN_ADDRESS"
```

**5.2 Initialize QuestManager**:
```bash
soroban contract invoke \
  --id $QUEST_MANAGER_ID \
  --network testnet \
  --source $SOROBAN_SECRET_KEY \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --verifier_contract $VERIFIER_ID \
  --player_registry $PLAYER_REGISTRY_ID \
  --achievement_nft $ACHIEVEMENT_NFT_ID
```

**5.3 Initialize PlayerRegistry**:
```bash
soroban contract invoke \
  --id $PLAYER_REGISTRY_ID \
  --network testnet \
  --source $SOROBAN_SECRET_KEY \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --quest_manager $QUEST_MANAGER_ID
```

**5.4 Initialize AchievementNFT**:
```bash
soroban contract invoke \
  --id $ACHIEVEMENT_NFT_ID \
  --network testnet \
  --source $SOROBAN_SECRET_KEY \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --quest_manager $QUEST_MANAGER_ID
```

### Step 6: Create Sudoku Quest

```bash
soroban contract invoke \
  --id $QUEST_MANAGER_ID \
  --network testnet \
  --source $SOROBAN_SECRET_KEY \
  -- create_quest \
  --creator $ADMIN_ADDRESS \
  --category Math \
  --difficulty Beginner \
  --title "Sudoku Puzzle #1" \
  --description_ipfs "ipfs://QmSudoku1" \
  --vk_hash "0000000000000000000000000000000000000000000000000000000000000000" \
  --reward_xp 100 \
  --reward_tokens 0
```

### Step 7: Update Frontend

Edit `frontend/.env`:

```env
# Network
VITE_STELLAR_NETWORK=TESTNET
VITE_DEMO_MODE=false

# Contracts
VITE_CONTRACT_QUEST_MANAGER=$QUEST_MANAGER_ID
VITE_CONTRACT_PLAYER_REGISTRY=$PLAYER_REGISTRY_ID
VITE_CONTRACT_ACHIEVEMENT_NFT=$ACHIEVEMENT_NFT_ID
VITE_CONTRACT_ULTRAHONK=$VERIFIER_ID

# RPC
VITE_TESTNET_RPC=https://soroban-testnet.stellar.org
VITE_FUTURENET_RPC=https://rpc-futurenet.stellar.org
```

### Step 8: Test Frontend

```bash
cd frontend
npm run dev
```

1. Open http://localhost:5173
2. Connect Freighter wallet (Testnet)
3. Solve the Sudoku
4. Click "Submit Quest"
5. Approve transaction in Freighter
6. Verify SBT minted on Stellar Expert

## Simple Alternative: Deploy on Futurenet

If Testnet has issues, use Futurenet:

```bash
soroban network add futurenet \
  --rpc-url https://rpc-futurenet.stellar.org \
  --network-passphrase "Test SDF Future Network ; October 2022"
```

Repeat the steps replacing `--network testnet` with `--network futurenet`.

## Debug

### View transaction logs:
```bash
soroban events --id $QUEST_MANAGER_ID --network testnet
```

### Query player profile:
```bash
soroban contract invoke \
  --id $PLAYER_REGISTRY_ID \
  --network testnet \
  -- get_profile \
  --player $ADMIN_ADDRESS
```

### Check minted achievement:
```bash
soroban contract invoke \
  --id $ACHIEVEMENT_NFT_ID \
  --network testnet \
  -- get_owner_achievements \
  --owner $ADMIN_ADDRESS
```

## Next Steps

1. **Fix contract compilation** (invoke_contract)
2. **Install Soroban CLI** when you have internet
3. **Deploy** following these steps
4. **Update .env** with real IDs
5. **Test** complete end-to-end flow
6. **Submit** to hackathon
