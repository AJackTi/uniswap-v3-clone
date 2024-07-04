require("dotenv").config();

const TETHER_ADDRESS = process.env.TETHER_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const WRAPPED_BITCOIN_ADDRESS = process.env.WRAPPED_BITCOIN_ADDRESS;
const WETH_ADDRESS = process.env.WETH_ADDRESS;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
const NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
const POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
const POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
const STORE_USER_DATA_ADDRESS = process.env.STORE_USER_DATA_ADDRESS;

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UserStorageData: require("../Context/UserStorageData.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");
const { promisify } = require("util");
const fs = require("fs");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const provider = ethers.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
);

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
);

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();

  const transaction = await nonfungiblePositionManager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });

  console.log("transaction:", transaction?.hash);
  await transaction.wait();

  const poolAddress = await factory.connect(owner).getPool(token0, token1, fee);
  return poolAddress;
}

async function addPool({ tokenAddress0, tokenAddress1, poolAddress }) {
  const [owner] = await ethers.getSigners();

  // ADD DATA
  const userStorageData = new ethers.Contract(
    STORE_USER_DATA_ADDRESS,
    artifacts.UserStorageData.abi,
    owner
  );
  console.log("userStorageData", userStorageData);

  const userLiquidity = await userStorageData.addToBlockchain(
    poolAddress,
    tokenAddress0,
    tokenAddress1
  );
  console.log("userLiquidity", userLiquidity);
}

async function main() {
  const usdtUsdc500 = await deployPool(
    TETHER_ADDRESS,
    USDC_ADDRESS,
    500,
    encodePriceSqrt(1, 1)
  );

  await addPool({
    tokenAddress0: TETHER_ADDRESS,
    tokenAddress1: USDC_ADDRESS,
    poolAddress: usdtUsdc500,
  });

  let addresses = [`USDT_USDC_500=${usdtUsdc500}`];
  const data = "\n" + addresses.join("\n");
  const writeFile = promisify(fs.appendFile);
  const filePath = ".env";
  return writeFile(filePath, data)
    .then(() => {
      console.log("Addresses recorded.");
      console.log(" ✅ Done");
    })
    .catch((error) => {
      console.error("Error logging addresses:", error);
      throw error;
    });
}
//
/*
  npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
