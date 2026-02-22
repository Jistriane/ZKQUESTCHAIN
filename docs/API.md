# API Reference - zkQuestChain Contracts

Complete documentation of the Soroban smart contract interfaces deployed on Stellar Testnet.

---

## 📋 Contract IDs (Testnet)

| Contract | Contract ID | Size |
|----------|------------|------|
| **QuestManager** | `CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK` | 15KB |
| **PlayerRegistry** | `CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O` | 9KB |
| **AchievementNFT** | `CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG` | 9KB |
| **UltraHonkVerifier** | `CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB` | 503 bytes |

---

## 1️⃣ QuestManager

**Main contract** that manages quests, proof validation, and rewards.

### 📌 initialize
```rust
fn initialize(
    admin: Address,
    verifier_contract: Address,
    player_registry: Address,
    achievement_nft: Address
) -> Result<(), Error>
```

**Description**: Initializes the contract with addresses of the auxiliary contracts.

**Parameters**:
- `admin` - Administrator address (only one who can create quests)
- `verifier_contract` - UltraHonkVerifier contract ID
- `player_registry` - PlayerRegistry contract ID
- `achievement_nft` - AchievementNFT contract ID

**Errors**:
- `AlreadyInitialized` - Contract has already been initialized

**CLI example**:
```bash
soroban contract invoke \
  --id CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK \
  --network testnet --source-account default -- initialize \
  --admin GB6TPMRQI2H4YN3FYP3VAMTGNYJBAJVMKLYK6IONG4B6NEQPH37F27YJ \
  --verifier_contract CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB \
  --player_registry CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O \
  --achievement_nft CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG
```

---

### 📌 create_quest
```rust
fn create_quest(
    creator: Address,
    category: Symbol,      // Math, Logic, Programming
    difficulty: Symbol,    // Beginner, Intermediate, Advanced
    title: String,
    description_ipfs: String,
    vk_hash: BytesN<32>,
    reward_xp: u32,
    reward_tokens: u32
) -> Result<u64, Error>
```

**Description**: Creates a new quest. **Only admin can create**.

**Parameters**:
- `creator` - Creator address (must be admin)
- `category` - Quest category: `Math`, `Logic`, `Programming`
- `difficulty` - Difficulty: `Beginner`, `Intermediate`, `Advanced`
- `title` - Quest title (e.g., "Sudoku #1")
- `description_ipfs` - IPFS URI with metadata (JSON)
- `vk_hash` - Verification key hash (32 bytes)
- `reward_xp` - XP to grant on completion
- `reward_tokens` - Tokens to grant (0 for MVP)

**Return**: `quest_id` (u64) - Unique ID of the created quest

**Errors**:
- `Unauthorized` - Only admin can create quests
- `InvalidTitle` - Empty or too long title

**CLI example**:
```bash
soroban contract invoke \
  --id CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK \
  --network testnet --source-account default -- create_quest \
  --creator GB6TPMRQI2H4YN3FYP3VAMTGNYJBAJVMKLYK6IONG4B6NEQPH37F27YJ \
  --category Math --difficulty Beginner \
  --title "Sudoku Challenge #1" \
  --description_ipfs "ipfs://QmSudoku1" \
  --vk_hash "0x0000000000000000000000000000000000000000000000000000000000000000" \
  --reward_xp 100 --reward_tokens 0
```

---

### 📌 submit_proof
```rust
fn submit_proof(
    player: Address,
    quest_id: u64,
    proof_blob: Bytes,
    public_inputs: Vec<BytesN<32>>
) -> Result<bool, Error>
```

**Description**: Submits a ZK proof for validation. **Main user function**.

**Parameters**:
- `player` - Player address submitting the proof
- `quest_id` - ID of the quest being completed
- `proof_blob` - Serialized proof (bytes)
- `public_inputs` - Circuit public inputs (hashes)

**Return**: `true` if accepted, `false` if rejected

**Errors**:
- `QuestNotFound` - Invalid quest_id
- `ProofVerificationFailed` - Invalid proof
- `AlreadyCompleted` - Player already completed this quest

**Emitted logs** (MVP - cross-contract calls disabled):
- `reward_player` - Indicates XP should be added
- `mint_achievement` - Indicates SBT should be minted

**Example via frontend**:
```typescript
import { contract } from '@stellar/stellar-sdk';

const result = await contract.invoke({
  contractId: 'CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK',
  method: 'submit_proof',
  args: [
    player,           // Address
    questId,          // u64
    proofBytes,       // Bytes
    publicInputs      // Vec<BytesN<32>>
  ],
  networkPassphrase: 'Test SDF Network ; September 2015',
  fee: '10000000'
});
```

---

### 📌 get_quest
```rust
fn get_quest(quest_id: u64) -> Result<Quest, Error>
```

**Description**: Fetches full quest information.

**Return**:
```rust
struct Quest {
    id: u64,
    creator: Address,
    category: Symbol,
    difficulty: Symbol,
    title: String,
    description_ipfs: String,
    vk_hash: BytesN<32>,
    reward_xp: u32,
    reward_tokens: u32,
    total_completions: u32,
    created_at: u64,  // timestamp
    is_active: bool
}
```

**CLI example**:
```bash
soroban contract invoke \
  --id CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK \
  --network testnet --source-account default -- get_quest \
  --quest_id 0
```

---

### 📌 get_quests_by_category
```rust
fn get_quests_by_category(category: Symbol) -> Vec<u64>
```

**Description**: Lists quest IDs by category.

**Parameters**:
- `category` - `Math`, `Logic`, or `Programming`

**Return**: Vec of quest_ids

---

### 📌 get_player_attempts
```rust
fn get_player_attempts(player: Address) -> Vec<QuestAttempt>
```

**Description**: Player attempt history.

**Return**:
```rust
struct QuestAttempt {
    quest_id: u64,
    player: Address,
    timestamp: u64,
    success: bool,
    proof_hash: BytesN<32>
}
```

---

## 2️⃣ PlayerRegistry

**Manages profiles**, XP, levels, and player statistics.

### 📌 initialize
```rust
fn initialize(
    admin: Address,
    quest_manager: Address
) -> Result<(), Error>
```

**Description**: Initializes the contract with a reference to QuestManager.

---

### 📌 register
```rust
fn register(
    player: Address,
    username: String
) -> Result<(), Error>
```

**Description**: Registers a new player. **Called automatically on first submit_proof**.

**Parameters**:
- `player` - Player address
- `username` - Username (unique)

**Errors**:
- `AlreadyRegistered` - Player already exists
- `UsernameTaken` - Username already in use

---

### 📌 add_xp
```rust
fn add_xp(player: Address, xp: u32) -> Result<(), Error>
```

**Description**: Adds XP to the player. **Called by QuestManager**.

**⚠️ MVP Limitation**: Cross-contract call disabled. Use manually:
```bash
soroban contract invoke \
  --id CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O \
  --network testnet --source-account default -- add_xp \
  --player GA... --xp 100
```

**Level calculation**:
```rust
level = integer_sqrt(total_xp / 100)
```

Examples:
- 0 XP = Level 0
- 100 XP = Level 1
- 400 XP = Level 2
- 900 XP = Level 3
- 10,000 XP = Level 10

---

### 📌 get_profile
```rust
fn get_profile(player: Address) -> Result<PlayerProfile, Error>
```

**Description**: Fetches full player profile.

**Return**:
```rust
struct PlayerProfile {
    player: Address,
    username: String,
    total_xp: u32,
    level: u32,
    quests_completed: u32,
    achievements_count: u32,
    registered_at: u64
}
```

---

## 3️⃣ AchievementNFT

**Mints SBTs** (Soulbound Tokens) for achievements.

### 📌 initialize
```rust
fn initialize(
    admin: Address,
    quest_manager: Address
) -> Result<(), Error>
```

---

### 📌 mint
```rust
fn mint(
    to: Address,
    quest_id: u64,
    proof_hash: BytesN<32>,
    metadata_uri: String
) -> Result<u64, Error>
```

**Description**: Mints an SBT for the player. **Called by QuestManager**.

**⚠️ MVP Limitation**: Cross-contract call disabled. Use manually:
```bash
soroban contract invoke \
  --id CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG \
  --network testnet --source-account default -- mint \
  --to GA... --quest_id 0 \
  --proof_hash "0x..." \
  --metadata_uri "ipfs://QmAchievement"
```

**Return**: `token_id` (u64)

**Soulbound characteristics**:
- **No `transfer()` function**
- Tokens are permanently bound to the owner
- Cannot be sold or transferred

---

### 📌 get_achievement
```rust
fn get_achievement(token_id: u64) -> Result<Achievement, Error>
```

**Return**:
```rust
struct Achievement {
    token_id: u64,
    owner: Address,
    quest_id: u64,
    proof_hash: BytesN<32>,
    metadata_uri: String,
    minted_at: u64
}
```

---

### 📌 get_owner_achievements
```rust
fn get_owner_achievements(owner: Address) -> Vec<u64>
```

**Description**: Lists all token_ids of SBTs owned by a player.

---

## 4️⃣ UltraHonkVerifier

**Verifies ZK proofs** using the UltraHonk/UltraPlonk algorithm.

### 📌 verify
```rust
fn verify(
    vk_hash: BytesN<32>,
    proof: Bytes,
    public_inputs: Vec<BytesN<32>>
) -> Result<bool, Error>
```

**Description**: Verifies the validity of a ZK proof.

**⚠️ MVP Implementation**: **STUB** - Always returns `true` for testing.

**Parameters**:
- `vk_hash` - Verification key hash (identifies the circuit)
- `proof` - Serialized proof
- `public_inputs` - Public inputs (e.g., puzzle hash)

**Return**: `true` if valid, `false` if invalid

**Roadmap v1.2**: Real implementation with pairing checks and Barretenberg backend.

---

## 🔐 Security

### Access Control
- **Admin-only functions**: `create_quest`, `initialize`
- **Player-callable**: `submit_proof`, `register`, `get_*`
- **Contract-only**: `add_xp`, `mint` (blocked in MVP, will be restricted)

### Validations
- Username uniqueness check
- Quest existence validation
- Double-completion prevention
- Proof replay protection (via proof_hash storage)

### Known Limitations (MVP)
1. **Verifier is stub** - Does not validate real proofs yet
2. **Cross-contract calls disabled** - Rewards not automatic
3. **No rate limiting** - Can submit multiple times
4. **IPFS URIs not validated** - Accepts any string

---

## 📊 Gas Costs (Testnet Estimates)

| Operation | Fee (XLM) | Ledgers |
|-----------|-----------|---------|
| `initialize` | ~0.0001 | 1 |
| `create_quest` | ~0.00005 | 1 |
| `submit_proof` | ~0.00001 | 1 |
| `register` | ~0.00003 | 1 |
| `get_quest` | Free (read-only) | 0 |
| `get_profile` | Free (read-only) | 0 |

**Total to complete a quest**: < 0.0002 XLM (~$0.00002 USD)

---

## 🧪 Testing via CLI

### Setup
```bash
# Configure identity
stellar keys generate default --network testnet

# Fund the account
curl -X POST "https://friendbot.stellar.org?addr=$(stellar keys address default)"
```

### Complete Flow
```bash
# 1. Create quest (admin)
QUEST_ID=$(soroban contract invoke \
  --id CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK \
  --network testnet --source-account default -- create_quest \
  --creator $(stellar keys address default) \
  --category Math --difficulty Beginner \
  --title "Test Quest" --description_ipfs "ipfs://test" \
  --vk_hash "0x0000000000000000000000000000000000000000000000000000000000000000" \
  --reward_xp 50 --reward_tokens 0)

# 2. Register player (auto on submit, but can run manually)
soroban contract invoke \
  --id CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O \
  --network testnet --source-account default -- register \
  --player $(stellar keys address default) --username "TestPlayer"

# 3. Submit proof (player)
soroban contract invoke \
  --id CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK \
  --network testnet --source-account default -- submit_proof \
  --player $(stellar keys address default) \
  --quest_id $QUEST_ID \
  --proof_blob "0x1234..." \
  --public_inputs '["0x0000000000000000000000000000000000000000000000000000000000000000"]'

# 4. Check profile
soroban contract invoke \
  --id CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O \
  --network testnet --source-account default -- get_profile \
  --player $(stellar keys address default)
```

---

## 📚 References

- **Soroban Docs**: https://soroban.stellar.org/docs
- **Stellar SDK**: https://github.com/stellar/js-stellar-sdk
- **Contract Explorer**: https://stellar.expert/explorer/testnet
- **Freighter Wallet**: https://www.freighter.app/

---

**Last Updated**: 17/02/2026  
**Network**: Stellar Testnet  
**SDK Version**: Soroban v22
