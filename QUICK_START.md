# Quick Start Guide - zkQuestChain

Quick guide to test the zkQuestChain MVP on Stellar Testnet.

---

## ⚡ 5 Minutes to Get Started

### 1. Prerequisites
```bash
# Check if you have Node.js 18+
node --version

# Install Freighter Wallet
# Chrome/Brave: https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk
```

### 2. Clone and Install
```bash
git clone <repo-url> zkQuestChain
cd zkQuestChain/frontend
npm install
```

### 3. Configure Environment
```bash
# The .env file is already configured with deployed contract IDs:
cat .env

# Should show:
# VITE_STELLAR_NETWORK=TESTNET
# VITE_QUEST_MANAGER_ID=CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK
# VITE_PLAYER_REGISTRY_ID=CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O
# VITE_ACHIEVEMENT_NFT_ID=CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG
# VITE_VERIFIER_ID=CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB
```

### 4. Run the Frontend
```bash
npm run dev

# Access: http://localhost:5176/ (port may vary if 5175 is busy)
```

### 5. Connect Your Wallet
1. Open Freighter extension
2. Switch to **Testnet**
3. If you don't have Testnet XLM, get it from Friendbot:
   ```bash
   curl -X POST "https://friendbot.stellar.org?addr=YOUR_PUBLIC_ADDRESS"
   ```
4. Click "Connect Wallet" in the UI

### 6. Solve a Sudoku!
1. Interface will show a puzzle
2. Click on empty cells to fill them
3. Use numbers 1-9
4. "Submit Proof" button will activate when solved
5. Click and wait:
   - ⚙️ Generating ZK proof (5-10 seconds)
   - 📡 Submitting transaction to Stellar Testnet
   - ✅ Verifying confirmation

---

## 🎮 Demo Mode (No Wallet)

To test without connecting a wallet:

```bash
# Edit frontend/.env
VITE_DEMO_MODE=true

# Reload the page
# Now you can simulate transactions locally
```

---

## 🔍 Checking on Blockchain

After submitting proof, click on the explorer link or visit:

```
https://stellar.expert/explorer/testnet/contract/CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK
```

You will see:
- Contract invocations
- Transaction arguments
- Gas used
- Timestamp

---

## 🛠️ Quick Troubleshooting

### ❌ "Account not found"
```bash
# Fund your account:
curl -X POST "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

### ❌ Freighter won't connect
1. Check if you're on **Testnet** network
2. Reload the extension
3. Clear browser cache

### ❌ "Transaction failed"
- Check balance (need ~1 XLM for gas)
- Make sure Sudoku is solved correctly
- See logs in browser console (F12)

### ❌ Proof takes too long
- Normal! ZK proofs in browser take 5-15s
- Don't close the tab during generation
- Check console for progress

### ❌ Build errors
```bash
# Clear cache and reinstall:
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

After testing the basics:

1. **Understand the Architecture**: Read [ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)
2. **See the Contracts**: Explore [docs/API.md](docs/API.md)
3. **Local Deploy**: Follow [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
4. **Develop**: Contribute following [README.md](README.md#desenvolvimento)

## 🆘 Help

- **Issues**: Open on GitHub
- **Questions**: Check [README.md](README.md)
- **Architecture**: See [ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)
- **Status**: Check [STATUS_FINAL.md](STATUS_FINAL.md)

---

**Estimated time**: 5-10 minutes  
**Difficulty**: ⭐⭐☆☆☆ (Beginner)  
**Prerequisites**: Node.js, Chrome/Brave  
**Network**: Stellar Testnet (free!)
