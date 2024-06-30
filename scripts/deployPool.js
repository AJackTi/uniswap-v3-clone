// npx hardhat run scripts/deployPool.js --network localhost

const WETHAddress = "0x721d8077771Ebf9B931733986d619aceea412a1C";
const factoryAddress = "0x38c76A767d45Fc390160449948aF80569E2C4217";
const swapRouterAddress = "0xDC57724Ea354ec925BaFfCA0cCf8A1248a8E5CF1";
const nftDescriptorAddress = "0xfc073209b7936A771F77F63D42019a3a93311869";
const nonfungibleTokenPositionDescriptorAddress =
  "0xb4e9A5BC64DC07f890367F72941403EEd7faDCbB";
const nonfungiblePositionManagerAddress =
  "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb";

const parveshAddress = "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92";
const payalAddress = "0x68d2Ecd85bDEbfFd075Fb6D87fFD829AD025DD5C";
const jiyanshiAddress = "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33";

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("BigNumber.js");
bn.config({
  EXPONENTIAL_AT: 999999,
  DECIMAL_PLACES: 40,
});

const MAINNET_URL =
  "https://eth-mainnet.g.alchemy.com/v2/d_i2rx_Ia6GaI5sQPI3I7tXhCdwEfTxQ";

const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

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

const nonfungiblePositionmanager = new Contract(
  nonfungiblePositionManagerAddress,
  artifacts.NonfungiblePositionManager.abi,
  provider
);

const factory = new Contract(
  factoryAddress,
  artifacts.UniswapV3Factory.abi,
  provider
);

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();

  console.log(`Creating pool for ${token0} / ${token1}`);
  console.log("Creating pool...");
  const poolTx = await nonfungiblePositionmanager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });
  console.log("Pool created");
  console.log("Pool tx: ", poolTx);

  const poolAddress = await factory.connect(owner).getPool(token0, token1, fee);
  console.log(`Pool address is ${poolAddress}`);
  return poolAddress;
}

async function main() {
  const ppjPool = await deployPool(
    parveshAddress,
    payalAddress,
    500,
    encodePriceSqrt(1, 1)
  );

  console.log("ppjPool: ", ppjPool);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
/**
 *
 console.log("Pool tx: ", poolTx);
 {
  type: 2,
  accessList: [],
  blockHash: '0x0274f0b19a8a3d9add58640fa56980df3259c68914173a7bc3dcc5d7ee6b6fa6',
  blockNumber: 18185067,
  transactionIndex: 0,
  confirmations: 1,
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  gasPrice: BigNumber { value: "23212612" },
  maxPriorityFeePerGas: BigNumber { value: "5564005" },
  maxFeePerGas: BigNumber { value: "23212612" },
  gasLimit: BigNumber { value: "5000000" },
  to: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
  value: BigNumber { value: "0" },
  nonce: 572,
  data: '0x13ead5620000000000000000000000008b64968f69e669facc86fa3484fd946f1bbe7c910000000000000000000000009a86494ba45ee1f9eeed9cfc0894f6c5d13a1f0b00000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000000000000  r: '0x23ff44854e710c5815a7685037ec2368c4ac3faa715f8871c571e520a2a11ed6',
  v: 0,
  creates: null,
  chainId: 31337,
}
Pool address is 0x4fc0f416Dc7676620C49F2e96FEBa9644E6865EA
 */
