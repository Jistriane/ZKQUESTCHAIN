# Changelog - zkQuestChain

All notable changes to this project will be documented here.

## [1.0.0] - 2026-02-17 - MVP Deployed

### 🎉 Initial Release

First functional version of zkQuestChain deployed on Stellar Testnet.

### ✅ Added

#### Smart Contracts (Soroban)
- `QuestManager` - Manages quests and proof validation
  - ID: `CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK`
  - Size: 15KB (optimized)
  - Functions: create_quest, submit_proof, get_quest, get_player_attempts
  
- `PlayerRegistry` - Manages player profiles and progression
  - ID: `CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O`
  - Size: 9KB (optimized)
  - Functions: register, add_xp, get_profile
  - Leveling system: level = sqrt(total_xp / 100)
  
- `AchievementNFT` - Mint SBTs for achievements
  - ID: `CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG`
  - Size: 9KB (optimized)
  - Functions: mint, get_achievement, get_owner_achievements
  - Characteristic: Soulbound (non-transferable)
  
- `UltraHonkVerifier` - ZK proof verifier
  - ID: `CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB`
  - Size: 503 bytes (optimized)
  - Functions: verify

#### ZK Circuit (Noir)
- Sudoku validator circuit
- Row, column, and box validation
- Pedersen hash for puzzle commitment
- Browser-optimized ACIR artifact
- Support for puzzle_hash=0 bypass (MVP)

#### Frontend (React)
- Interactive Sudoku interface
- Real-time local validation
- Freighter wallet integration
- Browser ZK proof generation (Noir.js + BB.js)
- Network switcher (Testnet/Futurenet)
- Transaction feedback with explorer links
- Demo mode for offline testing

#### Scripts
- `build_circuit.sh` - Compiles Noir circuit and extracts ACIR
- `build_contracts.sh` - Compiles Soroban contracts
- `deploy_all_contracts.sh` - Complete automated deployment
- `update_frontend_env.sh` - Updates .env with contract IDs

#### Documentation
- `README.md` - Main documentation
- `README_DEPLOY.md` - Testnet testing guide
- `STATUS_FINAL.md` - Complete project status
- `CONTRACT_IDS.md` - Deployed contract IDs
- `DEPLOY_INSTRUCTIONS.md` - Detailed deployment instructions
- `docs/ARCHITECTURE_SUMMARY.md` - System architecture
- `docs/API.md` - Contract interfaces
- `CHANGELOG.md` - This file

### 🔧 Configuration
- Soroban SDK v22
- Rust + cargo for compilation
- Optimized WASM without reference-types
- Vite 5 with top-level await support (target: esnext)
- CORS headers (COOP/COEP) for SharedArrayBuffer

### ⚠️ Known Limitations (MVP)

#### Cross-Contract Calls Disabled
- **Cause**: Soroban SDK v22 changed invoke_contract API
- **Impact**: PlayerRegistry.add_xp() and AchievementNFT.mint() not called automatically
- **Workaround**: Logs emitted, manual CLI calls possible
- **Planned fix**: v1.1 - Use contractclient! macro

#### ZK Verification is Stub
- **Cause**: UltraHonk integration pending
- **Impact**: verify_proof() always returns true
- **Workaround**: Local Sudoku validation prevents invalid solutions
- **Planned fix**: v1.2 - Implement real verifier

#### Manual Quest Creation
- **Cause**: No admin UI
- **Impact**: Quests must be created via CLI
- **Workaround**: soroban contract invoke script
- **Planned fix**: v1.3 - Admin panel

#### IPFS Not Integrated
- **Cause**: Storacha not configured
- **Impact**: Metadata URIs are hardcoded
- **Planned fix**: v1.4 - Storacha integration

### 🔨 Technical Fixes

- Fixed WASM compilation with `-C target-feature=-reference-types`
- Fixed Vite build with esnext target for top-level await
- Fixed Noir circuit with bitwise operators (&) instead of logical (&&)
- Fixed Hash<32> to BytesN<32> conversion in QuestManager
- Fixed integer_sqrt missing Self:: prefix in PlayerRegistry

### 📦 Main Dependencies

**Frontend**:
- react: ^18.2.0
- @stellar/stellar-sdk: ^12.3.0
- @noir-lang/noir_wasm: ^0.36.0
- @aztec/bb.js: ^0.67.1
- @freightertrust/api: ^1.7.1
- tailwindcss: ^3.4.1

**Contracts**:
- soroban-sdk: 22
- stellar-xdr: 22.1.0

**Circuits**:
- noir: (via nargo)

### 🚀 Deploy Info

- **Date**: 17/02/2026
- **Network**: Stellar Testnet
- **RPC**: https://soroban-testnet.stellar.org
- **Admin**: GB6TPMRQI2H4YN3FYP3VAMTGNYJBAJVMKLYK6IONG4B6NEQPH37F27YJ
- **Method**: Soroban CLI with default identity
- **Funding**: Friendbot

---

## [Unreleased] - Roadmap

### 🔮 Planned for v1.1
- [ ] Fix cross-contract calls using contractclient!
- [ ] Update to Soroban SDK v23 (if available)
- [ ] Complete contract unit tests
- [ ] CI/CD pipeline (GitHub Actions)

### 🔮 Planned for v1.2
- [ ] Implement real UltraHonk verifier
- [ ] PLONK integration as alternative
- [ ] Gas costs benchmark

### 🔮 Planned for v1.3
- [ ] Admin panel for quest creation
- [ ] Quest browser/marketplace
- [ ] Quest filters and search

### 🔮 Planned for v1.4
- [ ] IPFS integration via Storacha
- [ ] Automatic metadata upload
- [ ] Image hosting for achievements

### 🔮 Planned for v2.0
- [ ] Multiple quest types (Chess, Math, Programming)
- [ ] Global onchain leaderboard
- [ ] Reputation system
- [ ] Token rewards (fungible)
- [ ] Guild/team system
- [ ] Mobile app (React Native)

---

## Format

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## Categories

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for bug fixes
- `Security` for vulnerability fixes
