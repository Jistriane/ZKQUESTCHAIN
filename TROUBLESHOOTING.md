# Troubleshooting Guide - zkQuestChain

Solutions for common issues when using, developing, or deploying zkQuestChain.

---

## 🔥 Common User Issues

### ❌ "Account not found" when connecting wallet

**Symptom**: Error when trying to interact with contracts on Testnet.

**Cause**: Account is unfunded or does not exist on Testnet.

**Fix**:
```bash
# Get your public key in Freighter
# Then run:
curl -X POST "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY_HERE"

# Wait 5 seconds and reload the page
```

**Verify**:
```bash
# Check balance:
curl "https://horizon-testnet.stellar.org/accounts/YOUR_PUBLIC_KEY"
```

---

### ❌ Freighter won't connect

**Symptoms**:
- "Connect Wallet" button does nothing
- Extension popup doesn't open
- "Freighter not detected" error

**Fixes**:

1. **Check installation**:
   - Open `chrome://extensions` (or `brave://extensions`)
   - Confirm Freighter is installed and active
   - Minimum version: 5.0+

2. **Check network**:
   - Open Freighter → Settings → Network
   - **Must be on TESTNET**
   - If on Mainnet, switch to Testnet

3. **Clear cache**:
   ```bash
   # In browser console (F12):
   localStorage.clear()
   sessionStorage.clear()
   # Reload page (Ctrl+R)
   ```

4. **Reinstall extension** (last resort):
   - Uninstall Freighter
   - Restart browser
   - Reinstall from https://www.freighter.app/
   - **IMPORTANT**: Export your seed phrase first!

---

### ❌ ZK proof takes too long (>30 seconds)

**Symptom**: Infinite loading after clicking "Submit Proof".

**Causes and fixes**:

1. **Incompatible browser**:
   - ✅ Use Chrome 90+ or Brave
   - ❌ Avoid Firefox (slow WASM)
   - ❌ Avoid Safari (no SharedArrayBuffer)

2. **Weak hardware**:
   - ZK proofs are CPU-intensive
   - Minimum: 4GB RAM, dual-core CPU
   - Recommended: 8GB RAM, quad-core CPU
   - Close heavy tabs

3. **Check console**:
   ```javascript
   // F12 → Console
   // You should see:
   "Initializing Noir WASM..."
   "Generating proof..."
   "Proof generated successfully"

   // If nothing appears, reload:
   location.reload()
   ```

4. **SharedArrayBuffer not available**:
   ```javascript
   // F12 → Console
   console.log(typeof SharedArrayBuffer)
   // Should return "function"
   // If it returns "undefined":
   ```

   **Fix**: Verify COOP/COEP headers:
   ```bash
   # Inspect response headers:
   curl -I http://localhost:5173

   # Must include:
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Embedder-Policy: require-corp
   ```

---

### ❌ Transaction failed / "Insufficient funds"

**Symptom**: Proof generated but transaction fails.

**Causes**:

1. **Insufficient balance**:
   ```bash
   # Needs ~1 XLM for fees
   # Check:
   curl "https://horizon-testnet.stellar.org/accounts/YOUR_KEY"
   ```

   **Fix**:
   ```bash
   curl -X POST "https://friendbot.stellar.org?addr=YOUR_KEY"
   ```

2. **Wrong network**:
   - Freighter on **Mainnet** but app on **Testnet**
   - **Fix**: Switch Freighter to Testnet

3. **RPC down**:
   ```bash
   # Test RPC:
   curl https://soroban-testnet.stellar.org
   # Should return 200
   ```

4. **Fee too low**:
   - Rare, but possible in congestion
   - **Fix**: Wait 1 minute and try again

---

### ❌ "Invalid Sudoku solution"

**Symptom**: Cannot submit proof even with a solved Sudoku.

**Checks**:

1. **Numbers 1-4 only** (4x4 puzzle)
2. **No empty cells**
3. **No repeats**:
   - Each row: 1, 2, 3, 4 (no duplicates)
   - Each column: 1, 2, 3, 4
   - Each 2x2 box: 1, 2, 3, 4

4. **Do not change fixed numbers**:
   - **Bold** cells are read-only
   - They cannot be edited

**Debug**:
```javascript
// F12 → Console
// Paste solution:
const solution = [[1,2,3,4],[3,4,1,2],[2,3,4,1],[4,1,2,3]];
console.log(validateSudoku(solution));
// Should return true
```

---

## 🔧 Development Issues

### ❌ `npm install` fails

**Error**:
```
npm ERR! peer dependency
npm ERR! @aztec/bb.js requires @noir-lang/noir_wasm@^0.36.0
```

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### ❌ `npm run dev` - "Top-level await" error

**Error**:
```
Top-level await is not available in the configured target environment ("chrome87")
```

**Fix**: Check [frontend/vite.config.ts](frontend/vite.config.ts):
```typescript
export default defineConfig({
  build: {
    target: 'esnext', // MUST be esnext
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext' // MUST be esnext
    }
  }
})
```

---

### ❌ ACIR file not found

**Error**:
```
Failed to load ACIR: /sudoku.acir 404 Not Found
```

**Fix**:
```bash
# Compile circuit:
cd circuits
nargo compile

# Copy ACIR:
cp target/sudoku.acir ../frontend/public/

# Verify:
ls -lh ../frontend/public/sudoku.acir
# Must exist and be ~5KB
```

---

### ❌ Freighter types missing

**Error**:
```typescript
Cannot find module '@freightertrust/api'
```

**Fix**:
```bash
npm install @freightertrust/api
# or
npm install @stellar/freighter-api
```

---

## ⚙️ Deployment Issues

### ❌ Contract compilation: "reference-types not enabled"

**Full error**:
```
Error: failed to validate wasm module
zero byte expected: reference-types not enabled
```

**Cause**: Soroban doesn't support `reference-types` WASM feature.

**Fix**:
```bash
# ALWAYS compile with this flag:
cargo clean
RUSTFLAGS='-C link-arg=-s -C target-feature=-reference-types' \
  cargo build --release --target wasm32-unknown-unknown

# Then optimize:
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm
```

**Verify**:
```bash
# WASM must NOT have reference-types:
wasm2wat target/wasm32-unknown-unknown/release/quest_manager.wasm | grep -i reference
# Should return nothing
```

---

### ❌ `soroban deploy` - "Account does not exist"

**Symptom**: Deploy error even with Stellar CLI installed.

**Fix**:
```bash
# 1. Generate identity:
stellar keys generate default --network testnet

# 2. Get address:
ADDR=$(stellar keys address default)

# 3. Fund it:
curl -X POST "https://friendbot.stellar.org?addr=$ADDR"

# 4. Check balance (wait 5s):
curl "https://horizon-testnet.stellar.org/accounts/$ADDR"

# 5. Retry deploy:
soroban contract deploy \
  --wasm target/quest_manager.optimized.wasm \
  --network testnet \
  --source-account default
```

---

### ❌ Contract initialization timeout

**Symptom**: `soroban contract invoke --initialize` hangs indefinitely.

**Cause**: Freighter signing modal may be hidden or blocked by window focus.

**Workarounds**:

1. **Headless mode**:
   ```bash
   # Use --yes for auto-approve:
   soroban contract invoke --id CONTRACT_ID \
     --network testnet --source-account default \
     --yes -- initialize \
     --admin $(stellar keys address default) \
     --verifier_contract VERIFIER_ID \
     --player_registry REGISTRY_ID \
     --achievement_nft NFT_ID
   ```

2. **Via Stellar Lab**:
   - Go to https://laboratory.stellar.org/#txbuilder?network=test
   - Paste contract ID and function call manually
   - Sign with Freighter in browser

3. **Alternate script**:
   ```bash
   # Use soroban-cli in non-interactive mode
   # See scripts/initialize_contracts.sh
   ```

---

### ❌ WASM too large (>100KB)

**Symptom**: Deploy is slow or expensive.

**Fix - Optimization**:
```bash
# 1. Strip symbols:
RUSTFLAGS='-C link-arg=-s' cargo build --release

# 2. Use soroban optimize:
soroban contract optimize --wasm input.wasm

# 3. Check size:
ls -lh *.optimized.wasm
# QuestManager: ~15KB ✅
# PlayerRegistry: ~9KB ✅
# AchievementNFT: ~9KB ✅
```

**Advanced** (if still large):
```toml
# Cargo.toml
[profile.release]
opt-level = "z"      # Optimize for size
lto = true           # Link-time optimization
codegen-units = 1    # Single codegen unit
strip = true         # Strip symbols
panic = 'abort'      # No panic unwinding
```

---

### ❌ Cross-contract invoke fails: "ContractError(9)"

**Symptom**: `invoke_contract` returns a generic error.

**Cause**: Soroban SDK v22 changed API from `Vec<RawVal>` to `Vec<Val>`.

**Status**: **Known MVP limitation** - Cross-contract calls disabled.

**Current workaround**:
```rust
// Instead of:
// env.invoke_contract(&player_registry, &symbol_short!("add_xp"), args);

// Do:
env.events().publish((symbol_short!("reward"), player.clone(), xp), ());
```

**Planned fix v1.1**:
```rust
use soroban_sdk::contractclient;

#[contractclient(name = "PlayerRegistryClient")]
pub trait PlayerRegistryTrait {
    fn add_xp(player: Address, xp: u32);
}

// Then:
let registry_client = PlayerRegistryClient::new(&env, &player_registry);
registry_client.add_xp(&player, &xp);
```

---

## 🧪 Testing Issues

### ❌ Noir circuit: "Constraint failed"

**Symptom**: `nargo prove` returns "Constraint not satisfied".

**Debug**:
```bash
cd circuits
nargo execute witness

# Check Prover.toml:
cat Prover.toml

# Solution must be valid:
solution = [
    [1,2,3,4],
    [3,4,1,2],
    [2,3,4,1],
    [4,1,2,3]
]

# Puzzle should have zeros:
puzzle = [
    [0,2,0,4],
    [3,0,1,0],
    [2,3,0,1],
    [0,1,2,3]
]
```

**Manual validation**:
```python
# Python script to check:
solution = [[1,2,3,4],[3,4,1,2],[2,3,4,1],[4,1,2,3]]

# Rows
for row in solution:
    assert sorted(row) == [1,2,3,4], f"Invalid row: {row}"

# Columns
for col_idx in range(4):
    col = [solution[row][col_idx] for row in range(4)]
    assert sorted(col) == [1,2,3,4], f"Invalid column: {col}"

# 2x2 Boxes
for box_row in [0, 2]:
    for box_col in [0, 2]:
        box = [solution[i][j] for i in range(box_row, box_row+2)
                                for j in range(box_col, box_col+2)]
        assert sorted(box) == [1,2,3,4], f"Invalid box at ({box_row},{box_col})"

print("✅ Valid Sudoku!")
```

---

### ❌ Browser proof: "WASM execution error"

**Symptom**: Proof generation crashes in browser.

**Checklist**:

1. **Correct ACIR**:
   ```javascript
   // F12 → Network
   // Look for sudoku.acir
   // Status should be 200
   // Size ~5KB
   ```

2. **Noir.js version**:
   ```json
   // package.json
   "@noir-lang/noir_wasm": "^0.36.0" // ✅
   "@noir-lang/noir_wasm": "0.35.x"  // ❌ Incompatible
   ```

3. **BB.js compatibility**:
   ```json
   "@aztec/bb.js": "^0.67.1" // ✅ Compatible with Noir 0.36
   ```

4. **Memory limit**:
   ```javascript
   // Proofs require ~500MB RAM
   // Chrome limits ~2GB per tab
   // If it hangs, close other tabs
   ```

---

## 🔍 Debug Tools

### View contract logs

```bash
# Invoke with --verbose:
soroban contract invoke --id CONTRACT_ID \
  --network testnet --source-account default \
  --verbose -- submit_proof \
  --player $(stellar keys address default) \
  --quest_id 0 \
  --proof_blob "0x00" \
  --public_inputs '[]'

# Logs appear under "Events:"
```

### Inspect onchain state

```bash
# Use stellar-cli:
stellar contract read --id CONTRACT_ID \
  --network testnet \
  --key "quests:0"

# Or via Stellar Expert:
# https://stellar.expert/explorer/testnet/contract/CONTRACT_ID
```

### Monitor transactions

```bash
# Horizon stream tail:
curl -N "https://horizon-testnet.stellar.org/accounts/YOUR_ADDRESS/transactions?cursor=now&order=desc"

# Or use Stellar Expert:
# https://stellar.expert/explorer/testnet/account/YOUR_ADDRESS
```

### Browser DevTools checklist

```javascript
// F12 → Console

// 1. Check Freighter:
console.log(window.freighter)
// Should return an object

// 2. Check network:
console.log(import.meta.env.VITE_STELLAR_NETWORK)
// Should be "TESTNET"

// 3. Check contract IDs:
console.log(import.meta.env.VITE_QUEST_MANAGER_ID)
// Should start with "C..." (56 chars)

// 4. Test WASM:
console.log(typeof SharedArrayBuffer)
// Should be "function"

// 5. Check ACIR:
fetch('/sudoku.acir').then(r => console.log('ACIR:', r.status))
// Should log "ACIR: 200"
```

---

## 📞 Support

### Before opening an issue:

1. ✅ Read this troubleshooting guide
2. ✅ Check [STATUS_FINAL.md](STATUS_FINAL.md) for known limitations
3. ✅ Review browser console (F12)
4. ✅ Test demo mode (VITE_DEMO_MODE=true)

### When reporting an issue, include:

```markdown
**Environment**:
- OS: [Linux/Mac/Windows]
- Browser: [Chrome 120 / Brave 1.60]
- Node version: [node --version]
- npm version: [npm --version]

**Network**:
- Stellar network: [Testnet/Futurenet]
- Wallet: [Freighter 5.x]
- Account funded: [Yes/No]

**Error**:
- Exact error message
- Console screenshot (F12)
- Steps to reproduce

**Contract IDs** (if relevant):
- QuestManager: CAYL...
- PlayerRegistry: CBK3...
```

---

**Last updated**: February 17th, 2026  
**Version**: MVP 1.0.0  
**Contributors**: zkQuestChain Team
