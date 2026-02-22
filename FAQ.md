# FAQ - zkQuestChain

Frequently asked questions about the zkQuestChain project.

---

## 🌟 General

### What is zkQuestChain?

zkQuestChain is a **gamified quest platform** that combines:
- **Zero-Knowledge Proofs** (ZK) for private solution validation
- **Soroban Smart Contracts** (Stellar) for onchain verification
- **Soulbound Tokens** (SBTs) as non-transferable achievements

You solve puzzles (like Sudoku), generate a ZK proof in the browser, and receive XP + NFTs onchain without revealing your solution.

---

### Why use Zero-Knowledge?

**Privacy**: Your solution remains private. Only the proof is submitted.

**Examples**:
- 🧩 Sudoku: Prove you solved it without showing the numbers
- ♟️ Chess: Prove you found checkmate in 3 moves without revealing the sequence
- 🧮 Math: Prove you know the factorization of a number without showing the factors

**Additional benefit**: Anti-cheating. Can't copy others' solutions.

---

### What is a Soulbound Token (SBT)?

It's a **non-transferable NFT**. Once minted to you, it's permanently attached to your wallet.

**Characteristics**:
- ❌ Cannot sell
- ❌ Cannot transfer
- ✅ Permanent proof of achievement
- ✅ Onchain reputation

**Example**: Your "Sudoku Master Lvl 10" SBT proves you completed 100 quests. Nobody can buy or steal that achievement.

---

### Why Stellar/Soroban?

**Stellar Advantages**:
- ⚡ **Ultra-low fees**: <$0.0001 per transaction
- 🚀 **Fast finality**: ~5 seconds
- 🌍 **Eco-friendly**: Proof-of-Stake (no mining)
- 🛠️ **Rust smart contracts**: Type-safe, performant

**Comparison**:
| Chain | Tx Fee | Finality | Language |
|-------|--------|----------|----------|
| Stellar | $0.00001 | 5s | Rust (Soroban) |
| Ethereum | $5-50 | 12s | Solidity |
| Polygon | $0.01 | 2s | Solidity |

---

## 🎮 Using the Platform

### How do I start?

See [QUICK_START.md](QUICK_START.md) for a 5-minute guide.

**TL;DR**:
1. Install Freighter wallet
2. Switch to Testnet
3. Fund with Friendbot
4. Access http://localhost:5173 (or deployed URL)
5. Connect wallet
6. Solve Sudoku
7. Submit proof!

---

### Do I need to pay to play?

**Testnet**: ❌ Free! Use Friendbot to get test XLM.

**Mainnet** (when available): 
- ✅ Almost free: ~$0.00001 per quest
- 💰 May earn reward tokens (future)

---

### How long does it take to generate a proof?

**Browser (WASM)**:
- 📱 Mobile: 15-30 seconds
- 💻 Desktop: 5-10 seconds
- 🖥️ High-end: 3-5 seconds

**Factors**:
- CPU speed (single-thread performance)
- Browser (Chrome/Brave are faster)
- Circuit size (Sudoku 4x4 is small)

**Future**: Worker threads can parallelize to <3s.

---

### Why didn't my XP increase automatically?

**MVP Limitation**: Cross-contract calls are disabled due to changes in Soroban SDK v22.

**Current workaround**:
```bash
# Add XP manually via CLI:
soroban contract invoke \
  --id CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O \
  --network testnet --source-account default -- add_xp \
  --player YOUR_WALLET --xp 100
```

**Fix**: Version v1.1 will have this automated with `contractclient!` macro.

---

### How does the leveling system work?

**Formula**:
```
level = sqrt(total_xp / 100)
```

**Progression Table**:
| Total XP | Level | Quests (100 XP each) |
|----------|-------|---------------------|
| 0 | 0 | 0 |
| 100 | 1 | 1 |
| 400 | 2 | 4 |
| 900 | 3 | 9 |
| 1,600 | 4 | 16 |
| 2,500 | 5 | 25 |
| 10,000 | 10 | 100 |

**Design**: Progression gets slower (avoids excessive farming).

---

### Can I create my own quests?

**MVP**: ❌ No. Only admin can create via CLI.

**Roadmap v1.3**: ✅ Admin panel UI to create quests visually.

**Roadmap v2.0**: ✅ Permissions for approved creators (decentralization).

---

### What types of puzzles are supported?

**MVP (v1.0)**:
- ✅ Sudoku 4x4

**Roadmap**:
- v1.5: Sudoku 9x9
- v2.0: Chess puzzles (checkmate in N moves)
- v2.0: Math challenges (factoring, discrete log)
- v2.1: Programming challenges (algorithm optimization)
- v3.0: Custom circuits (community creates their own)

---

## 🔧 Technical

### What is Noir?

**Noir** is a programming language for writing **ZK circuits**.

**Characteristics**:
- 🦀 Rust-like syntax
- 🔒 Type-safe with guaranteed proofs
- 🌐 Compiles to ACIR (circuit IR)
- 📦 Runs in browser via WASM

**Example**:
```rust
fn main(puzzle: [[Field; 4]; 4], solution: [[Field; 4]; 4]) {
    // Validates that solution solves the puzzle
    validate_sudoku(solution);
    // Proof confirms: "I know a valid solution"
}
```

---

### What is UltraHonk?

**UltraHonk** is a ZK proving system (PLONK successor).

**Advantages**:
- ⚡ Small proofs (~1KB)
- 🚀 Fast verification (~10ms onchain)
- 🔐 Security based on pairings

**Status in zkQuestChain**: 
- MVP uses **stub** (always returns true)
- v1.2 will have real implementation with Barretenberg

---

### Why Barretenberg?

**Barretenberg** is the proving backend used by Aztec.

**Reasons**:
- ✅ Official Noir support
- ✅ WASM-ready (runs in browser)
- ✅ Optimized (Assembly x86/ARM)
- ✅ Provably secure
- ✅ Open-source

**Alternative considered**: Halo2 (Zcash) - but no Noir support yet.

---

### How does the onchain verifier work?

**Process**:

1. **Browser**: Generates proof with Barretenberg.js
   - Input: puzzle + solution
   - Output: proof (bytes) + public_inputs

2. **Frontend**: Serializes proof and sends via Stellar SDK
   ```typescript
   await contract.invoke('submit_proof', [player, quest_id, proof, inputs])
   ```

3. **QuestManager contract**: Receives proof
   ```rust
   pub fn submit_proof(proof: Bytes, inputs: Vec<BytesN<32>>) -> bool
   ```

4. **UltraHonkVerifier**: Validates pairing equations
   ```rust
   env.invoke_contract(&verifier, &symbol_short!("verify"), args)
   ```

5. **If valid**: Emits reward events
   ```rust
   env.events().publish((symbol_short!("reward"), player, xp), ());
   ```

**MVP**: Step 4 is stub (always accepts). v1.2 will have real pairing checks.

---

### What is the size of the contracts?

| Contract | Original | Optimized | Functions |
|----------|----------|-----------|-----------|
| QuestManager | ~50KB | 15KB | 6 |
| PlayerRegistry | ~30KB | 9KB | 4 |
| AchievementNFT | ~30KB | 9KB | 4 |
| UltraHonkVerifier | ~1KB | 503 bytes | 1 |

**Total**: ~35KB onchain (very efficient!)

**Optimization**:
```bash
RUSTFLAGS='-C link-arg=-s -C target-feature=-reference-types' \
  cargo build --release
soroban contract optimize --wasm input.wasm
```

---

### Why WASM and not EVM?

**Comparison**:

| Feature | Soroban WASM | EVM |
|---------|--------------|-----|
| Language | Rust, C++, AssemblyScript | Solidity, Vyper |
| Performance | ~Native speed | ~10-100x slower |
| Type safety | ✅ Compile-time | ⚠️ Runtime |
| Gas costs | Linear | Quadratic (expensive loops) |
| Ecosystem | New (2023) | Mature (2015) |

**Trade-off**: Soroban is more performant but has less tooling (for now).

---

## 🚀 Roadmap & Future

### When will it go to Mainnet?

**Planning**:
- **Q1 2026**: MVP on Testnet (✅ Done!)
- **Q2 2026**: Security audits
- **Q3 2026**: Mainnet beta with limits
- **Q4 2026**: Mainnet full release

**Requirements for Mainnet**:
1. ✅ Audited contracts
2. ✅ Real UltraHonk verifier
3. ✅ 100% test coverage
4. ✅ Bug bounty program
5. ✅ Circuit formal verification

---

### Will there be a native token?

**Possibility**: Yes, but not confirmed.

**Potential use cases**:
- 💰 Rewards for quest creators
- 🎫 Staking for governance
- 🏆 Prizes for leaderboard top players
- 🔓 Unlock premium quests

**Decision**: Community will vote (DAO) after Mainnet stabilizes.

---

### Mobile app?

**Roadmap v2.0+**: React Native app with:
- 📱 Native UX (not browser)
- ⚡ Proofs in background thread
- 🔔 New quest notifications
- 🌐 Freighter mobile integration

**Timeline**: Q4 2026 (after Mainnet).

---

### Will it support other blockchains?

**Multi-chain plan** (v3.0):
- 🌊 Stellar (primary)
- 🔷 Polygon (low cost)
- ⚡ Arbitrum (Ethereum L2)
- 🌌 Cosmos (IBC interchain)

**Architecture**:
- Duplicated contracts on each chain
- Bridge to transfer achievements (if not soulbound)
- Unified offchain leaderboard

---

## 💡 Development

### How to contribute?

See [README.md](README.md#contributing) for guidelines.

**Areas needing help**:
- 🐛 Bug fixes
- 📝 Documentation
- 🧪 Tests
- 🎨 UI/UX design
- 🔐 Security audits
- 🌍 Translations (i18n)

**Process**:
1. Fork the repo
2. Create branch: `git checkout -b feature/name`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Open PR with detailed description

---

### Can I use this code in my project?

**License**: MIT (open-source).

✅ **Permitted**:
- Commercial use
- Modification
- Distribution
- Sublicensing

❌ **Conditions**:
- Keep copyright notice
- Include MIT license copy

**Attribution example**:
```markdown
Based on zkQuestChain by [Your Team]
Original: https://github.com/your-org/zkQuestChain
License: MIT
```

---

### Where to learn more about ZK?

**Recommended resources**:

1. **Beginner**:
   - 📺 [ZK Whiteboard Sessions](https://www.youtube.com/@zeroknowledgefm) - Dan Boneh
   - 📖 [ZK Book](https://www.zkdocs.com/) - Visual documentation

2. **Intermediate**:
   - 📝 [Noir Lang Docs](https://noir-lang.org/docs)
   - 🎓 [ZK MOOC](https://zk-learning.org/) - Complete course

3. **Advanced**:
   - 📄 [PLONK Paper](https://eprint.iacr.org/2019/953)
   - 📄 [UltraHonk Spec](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg/cpp/src/barretenberg/ultra_honk)

---

### Complete roadmap?

See [CHANGELOG.md](CHANGELOG.md#unreleased---roadmap) for detailed list.

**Highlights**:
- **v1.1**: Working cross-contract calls
- **v1.2**: Real UltraHonk verifier
- **v1.3**: Admin panel UI
- **v1.4**: IPFS integration
- **v2.0**: Multiple quest types, leaderboard, tokens
- **v3.0**: Multi-chain, custom circuits, mobile app

---

## 🛡️ Security

### Is it safe to use?

**Testnet**: ✅ Safe for testing (don't use real values).

**Mainnet** (future): Wait for complete audit before using with real values.

**Known MVP limitations**:
1. ⚠️ ZK Verifier is stub (accepts any proof)
2. ⚠️ No rate limiting (spam possible)
3. ⚠️ Cross-contract calls disabled

See [STATUS_FINAL.md](STATUS_FINAL.md) for complete list.

---

### How to report a vulnerability?

**DO NOT open public issue!**

**Secure contact**:
1. Email: security@zkquestchain.com (use PGP if possible)
2. Twitter DM: @zkQuestChain
3. Private Discord: [Server link]

**Rewards** (after Mainnet):
- 🐛 Low: $100-500
- ⚠️ Medium: $500-2000
- 🚨 High: $2000-10000
- 💀 Critical: $10000+

---

### What audits have been done?

**Current status**: ❌ None (MVP in development).

**Planned**:
- **Q2 2026**: Trail of Bits (Soroban contracts)
- **Q2 2026**: ABDK (Noir circuits)
- **Q3 2026**: Independent review (community)

**After audits**: Public reports in `/audits/`.

---

## 📞 Support

### Where to ask for help?

1. **Documentation**:
   - [QUICK_START.md](QUICK_START.md) - Quick setup
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common problems
   - [ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md) - How it works

2. **GitHub Issues**: For bugs and feature requests

3. **Discord**: For discussions and quick questions

4. **Twitter**: @zkQuestChain - Updates

---

### Is the project active?

✅ **Yes!** MVP deployed on 17/02/2026.

**Status**:
- 🟢 Contracts on Testnet working
- 🟢 Frontend running
- 🟡 Complete documentation (this FAQ!)
- 🔴 Mainnet awaiting audits

**Commits**: See [GitHub Activity](https://github.com/your-org/zkQuestChain/pulse).

---

**Last Update**: 17/02/2026  
**Version**: MVP 1.0.0  
**Didn't find your question?**: Open an issue on GitHub!
