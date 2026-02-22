# zkQuestChain — System Architecture (MVP Deployed)

## 🎯 Context

zkQuestChain is an educational onchain gaming platform where users complete quests (currently Sudoku) and prove completion via Zero-Knowledge proofs. Proofs are verified in Soroban contracts on the Stellar blockchain, resulting in the minting of Achievement NFTs (SBTs).

**Status**: MVP deployed on Stellar Testnet (February 17th, 2026)

## 🏗️ System Components

### 1. Frontend (React/Vite)
- **Location**: `frontend/src/`
- **Technologies**: React 18, TypeScript, Tailwind CSS, Vite 5
- **Functions**:
  - Interactive Sudoku interface with local validation
  - ZK proof generation in browser (Noir.js + BB.js)
  - Freighter wallet integration
  - Transaction submission to Soroban
  - Network switcher (Testnet/Futurenet)
  - Transaction feedback with explorer links

### 2. ZK Engine (Noir + Barretenberg)
- **Location**: `circuits/sudoku/`
- **Technologies**: Noir language, BB.js (Barretenberg WASM)
- **Functions**:
  - Noir circuit validates Sudoku solution without revealing it
  - Commitment verification (Pedersen hash) of puzzle
  - UltraHonk proof generation in browser
  - ACIR artifact optimized for client-side execution

### 3. Soroban Smart Contracts (Rust)
- **Location**: `contracts/`
- **Network**: Stellar Testnet
- **SDK**: Soroban SDK v22

#### 3.1 QuestManager
- **ID**: `CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK`
- **Size**: 15KB (optimized)
- **Functions**:
  - `create_quest()` - Creates new quest
  - `submit_proof()` - Validates proof and records completion
  - `get_quest()` - Queries quest data
  - `get_player_attempts()` - Attempt history
- **MVP Note**: Proof verification is stub (returns `true`)

#### 3.2 PlayerRegistry
- **ID**: `CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O`
- **Size**: 9KB (optimized)
- **Functions**:
  - `register()` - Creates player profile
  - `add_xp()` - Adds XP (called by QuestManager)
  - `get_profile()` - Queries complete profile
- **Level System**: `level = sqrt(total_xp / 100)`
- **MVP Note**: Cross-contract call replaced with log

#### 3.3 AchievementNFT
- **ID**: `CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG`
- **Size**: 9KB (optimized)
- **Functions**:
  - `mint()` - Mints achievement SBT
  - `get_achievement()` - Queries achievement by ID
  - `get_owner_achievements()` - Lists player's achievements
- **Characteristics**: Soulbound (non-transferable)
- **MVP Note**: Cross-contract call replaced with log

#### 3.4 UltraHonkVerifier
- **ID**: `CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB`
- **Size**: 503 bytes (optimized)
- **Functions**:
  - `verify()` - Verifies UltraHonk proof
- **MVP Note**: Stub implementation, returns `true`

### 4. IPFS / Storage (Future)
- **Technology**: Storacha (Web3.Storage)
- **Planned Use**:
  - Quest metadata (description, rules, images)
  - Achievement metadata (name, image, attributes)
- **MVP Note**: URLs are simulated (hardcoded)

### 5. Infrastructure
- **Blockchain**: Stellar Testnet
- **RPC**: https://soroban-testnet.stellar.org
- **Horizon**: https://horizon-testnet.stellar.org
- **Explorer**: https://stellar.expert/explorer/testnet
- **Wallet**: Freighter extension
- **Frontend Hosting**: Vercel (planned)

## 🔄 End-to-End Flow

### User Journey

```
1. CONNECT WALLET
   └─ User opens dApp
   └─ Clicks "Connect Wallet"
   └─ Freighter displays popup
   └─ User approves connection
   └─ dApp obtains public key

2. SOLVE QUEST
   └─ dApp shows Sudoku puzzle
   └─ User fills cells
   └─ Local validation (rows/cols/boxes)
   └─ "Submit" button enabled when valid

3. GENERATE ZK PROOF
   └─ User clicks "Submit Quest"
   └─ Frontend loads circuit.acir
   └─ Noir.js compiles witness
   └─ BB.js generates UltraHonk proof
   └─ Proof serialized to bytes

4. SUBMIT TRANSACTION
   └─ dApp builds XDR transaction
   └─ Calls QuestManager.submit_proof()
   └─ Freighter shows confirmation
   └─ User approves (signs tx)
   └─ TX submitted to Stellar RPC

5. ONCHAIN VERIFICATION (Stub in MVP)
   └─ QuestManager.submit_proof() executed
   └─ [Stub] verify_proof() returns true
   └─ Attempt recorded in storage
   └─ [Log] reward_player() emits logs
   └─ Quest.completion_count incremented

6. VISUAL FEEDBACK
   └─ dApp receives transaction hash
   └─ Shows success message
   └─ Displays link to Stellar Explorer
   └─ User can see TX onchain
```

### Sequence Diagram

```
User      Frontend    Noir.js    Freighter    Soroban         Contracts
  |           |           |           |            |                |
  |─solve───>|           |           |            |                |
  |           |─validate>|           |            |                |
  |           |<──valid──|           |            |                |
  |─submit──>|           |           |            |                |
  |           |─generate>|           |            |                |
  |           |           |─compute>|            |                |
  |           |<──proof──|           |            |                |
  |           |─build_tx──────────>|            |                |
  |           |           |           |──sign───>|                |
  |<─approve─|           |           |            |                |
  |─confirm─>|           |           |            |                |
  |           |           |           |─submit──>|                |
  |           |           |           |            |─submit_proof─>|
  |           |           |           |            |                |─verify─────(stub)
  |           |           |           |            |                |─register────(attempt)
  |           |           |           |            |                |─[log]──────(reward)
  |           |           |           |            |<───success────|
  |           |           |           |<─tx_hash─|                |
  |           |<─────────────────|                |
  |<─success─|           |           |            |                |
  |─view_tx────────────────────────────(Stellar Explorer)
```

## 🔒 Security

### Authentication
- **`require_auth()`** on all sensitive functions
- Admin-only for `create_quest()` and `initialize()`
- Cross-contract auth for `add_xp()` and `mint()`

### Data Validation
- Sudoku validated locally before submission
- Proof bytes verified (future; currently stub)
- Quest IDs validated against storage

### Storage
- Persistent storage for critical data (quests, profiles)
- Instance storage for configuration (contract addresses)
- No storage of secrets or private keys

### Patterns
- **CEI Pattern** (Checks-Effects-Interactions)
- Storage writes before external calls
- No custody of assets

## 📊 Observability

### Onchain Logs
```rust
log!(&env, "Quest {} completed by {}", quest_id, player);
log!(&env, "Rewarding player");
```

### Frontend Feedback
- Transaction hash displayed after submission
- Direct link to Stellar Explorer
- Loading states during proof generation
- Detailed error messages

### Monitoring (Planned)
- Stellar Expert for contract analytics
- Horizon API for transaction history
- Custom analytics via Edge Functions

## ⚠️ Known Limitations (MVP)

### 1. Cross-Contract Calls Disabled
**Problem**: Soroban SDK v22 changed `invoke_contract` API, requires `Vec<Val>` with complex conversions.

**Impact**:
- `reward_player()` does not invoke `PlayerRegistry.add_xp()`
- `reward_player()` does not invoke `AchievementNFT.mint()`
- Only logs are emitted

**Workaround**:
- Call manually via CLI:
  ```bash
  soroban contract invoke --id <PLAYER_REGISTRY> --network testnet \
    -- add_xp --player <ADDR> --xp 100
  
  soroban contract invoke --id <ACHIEVEMENT_NFT> --network testnet \
    -- mint --to <ADDR> --quest_id 1 --proof_hash <HASH> --metadata_uri <URI>
  ```

**Future Fix**: Use `contractclient!` macro or updated SDK.

### 2. ZK Verification is Stub
**Problem**: UltraHonk integration with Soroban not finalized.

**Impact**:
- `verify_proof()` always returns `true`
- Any proof is accepted

**Workaround**: Local Sudoku validation prevents invalid submissions.

**Future Fix**: Implement real UltraHonk verifier or use PLONK.

### 3. Manual Quest Creation
**Problem**: No UI for creating quests.

**Workaround**: Use Soroban CLI:
```bash
soroban contract invoke --id <QUEST_MANAGER> --network testnet \
  -- create_quest \
  --creator <ADMIN_ADDR> \
  --category Math \
  --difficulty Beginner \
  --title "Sudoku #1" \
  --description_ipfs "ipfs://..." \
  --vk_hash "0x00..." \
  --reward_xp 100 \
  --reward_tokens 0
```

### 4. IPFS Not Integrated
**Problem**: Storacha not configured.

**Impact**: Metadata URIs are hardcoded.

**Future Fix**: Integrate Storacha SDK for automatic uploads.

## 🚀 Post-MVP Roadmap

### Short Term
1. Fix cross-contract calls (contractclient! or SDK update)
2. Implement real UltraHonk verification
3. UI for quest creation
4. IPFS integration (Storacha)

### Mid Term
5. Multiple quest types (Chess, Math, Programming)
6. Global onchain leaderboard
7. Reputation system
8. Token rewards (fungible)
9. Guild/team system

### Long Term
10. Quest marketplace (user-created quests)
11. Dynamic difficulty adjustment
12. Cross-chain bridging
13. Mobile app (React Native)
14. DAO governance

## 📝 References

- **Soroban Docs**: https://soroban.stellar.org/docs
- **Noir Docs**: https://noir-lang.org/docs
- **Stellar Expert**: https://stellar.expert/explorer/testnet
- **Freighter Wallet**: https://www.freighter.app/
- **BB.js**: https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg/ts

## 👥 Team

Project developed for Stellar Hacks: ZK Gaming Challenge

**Deploy**: February 17th, 2026  
**Version**: MVP 1.0  
**License**: MIT
