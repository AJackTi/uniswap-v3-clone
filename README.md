## Installation

Install uniswap-v3-clone with yarn

```bash
  get clone git@github.com:AJackTi/uniswap-v3-clone.git && cd uniswap-v3-clone
  yarn
```

Run initial hardhat

```bash
  npx hardhat clean
  npx hardhat compile
  npx hardhat node
```

Run hardhat scripts

```bash
  npx hardhat run --network localhost scripts/01_deployContracts.js
  npx hardhat run --network localhost scripts/02_deployTokens.js
  npx hardhat run --network localhost scripts/03_deployPools.js
  npx hardhat run --network localhost scripts/04_addLiquidity.js
  npx hardhat run --network localhost scripts/05_checkLiquidity.js
```

Run fontend

```bash
  npm run dev
```
