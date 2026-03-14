# Test Directory

Test scripts for the Avalanche DEX Router project.

## Structure

```
test/
├── scripts/          # Core test scripts
│   ├── test-all-dexes.js      # Test all DEXes + DexRouter contract
│   ├── test-real-quotes.js    # Test quotes from TJ V1, V2, V3 pools
│   ├── test-swap.js           # Test swap readiness on contract
│   ├── test-contract-direct.js # Direct contract interaction
│   └── check-fees.js          # Fee checking utility
├── api/              # API tests
│   ├── query_dexes.ts         # Query DEX utilities
│   └── test_new_quotes.ts     # New quote system tests
├── api-test.sh       # API endpoint tests
└── e2e-swap-test.sh  # End-to-end swap tests
```

## Running Tests

### Test all DEXes
```bash
cd test/scripts
node test-all-dexes.js
```

### Test quotes
```bash
node test-real-quotes.js
```

### Test swap readiness
```bash
node test-swap.js
```

### Test contract directly
```bash
node test-contract-direct.js
```

### Check fees
```bash
node check-fees.js
```

### API tests
```bash
cd test/api
npx ts-node query_dexes.ts
npx ts-node test_new_quotes.ts
```

### Shell tests
```bash
./test/api-test.sh
./test/e2e-swap-test.sh
```

## Contract Tests

Contract unit tests are in `packages/contracts/test/`:

```bash
cd packages/contracts
npm test