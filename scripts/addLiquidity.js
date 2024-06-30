// npx hardhat run scripts/addLiquidity.js --network localhost

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

const poolAddress = "0x4fc0f416Dc7676620C49F2e96FEBa9644E6865EA";

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Parvesh: require("../artifacts/contracts/Parvesh.sol/Parvesh.json"),
  Payal: require("../artifacts/contracts/Payal.sol/Payal.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");

const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing,
    fee,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const ParveshContract = new Contract(
    parveshAddress,
    artifacts.Parvesh.abi,
    provider
  );

  const PayalContract = new Contract(
    payalAddress,
    artifacts.Payal.abi,
    provider
  );

  await ParveshContract.connect(signer2).approve(
    nonfungiblePositionManagerAddress,
    ethers.utils.parseEther("1000")
  );

  await PayalContract.connect(signer2).approve(
    nonfungiblePositionManagerAddress,
    ethers.utils.parseEther("1000")
  );

  const poolContract = new Contract(
    poolAddress,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  const poolData = await getPoolData(poolContract);

  const ParveshToken = new Token(31337, parveshAddress, 18, "Parvesh", "PINNU");
  const PayalToken = new Token(31337, payalAddress, 18, "Payal", "PHLA");

  const pool = new Pool(
    ParveshToken,
    PayalToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const position = new Position({
    pool,
    liquidity: ethers.utils.parseEther("1"),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  params = {
    token0: parveshAddress,
    token1: payalAddress,
    fee: poolData.fee,
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  const nonfungiblePositionmanager = new Contract(
    nonfungiblePositionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  const tx = await nonfungiblePositionmanager.connect(signer2).mint(params, {
    gasLimit: "1000000",
  });

  const receipt = await tx.wait();
  console.log("receipt: ", receipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
/**
{
  to: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
  from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  contractAddress: null,
  transactionIndex: 0,
  gasUsed: BigNumber { value: "617071" },
  logsBloom: '0x0000000000000000000210100000000000000000000000000000000000080000000000000000000000000000000000000000300000000000050000000024000000000000000000004000000800000000000000000004000000000000000008000000080002000000000000000000080000000000080002000000001c000000000000000008001000000000000000040000000000004400000000000000000000020000000000000820008000000000000008100008000000000000400000000000000002000000000000180000000000000000000000000000000000000060400010000000000000000000001000000001000000000000000000000000000800',
  blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
  transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
  logs: [
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 0,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000003635c620c73b4ba437',
      logIndex: 1,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 2,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000003635c620c73b4ba437',
      logIndex: 3,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x4fc0f416Dc7676620C49F2e96FEBa9644E6865EA',
      topics: [Array],
      data: '0x000000000000000000000000a68e430060f74f9821d2dc9a9e2ce3af7d842ebe0000000000000000000000000000000000000000000000000de0b6b3a76403d900000000000000000000000000000000000000000000000000038cfea3545bc900000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 4,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
      topics: [Array],
      data: '0x',
      logIndex: 5,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
      topics: [Array],
      data: '0x0000000000000000000000000000000000000000000000000de0b6b3a76403d900000000000000000000000000000000000000000000000000038cfea3545bc900000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 6,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7'
    }
  ],
  blockNumber: 18185072,
  confirmations: 1,
  cumulativeGasUsed: BigNumber { value: "617071" },
  effectiveGasPrice: BigNumber { value: "12446249" },
  status: 1,
  type: 2,
  byzantium: true,
  events: [
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 0,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000003635c620c73b4ba437',
      logIndex: 1,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 2,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
      topics: [Array],
      data: '0x00000000000000000000000000000000000000000000003635c620c73b4ba437',
      logIndex: 3,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0x4fc0f416Dc7676620C49F2e96FEBa9644E6865EA',
      topics: [Array],
      data: '0x000000000000000000000000a68e430060f74f9821d2dc9a9e2ce3af7d842ebe0000000000000000000000000000000000000000000000000de0b6b3a76403d900000000000000000000000000000000000000000000000000038cfea3545bc900000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 4,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
      topics: [Array],
      data: '0x',
      logIndex: 5,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      args: [Array],
      decode: [Function (anonymous)],
      event: 'Transfer',
      eventSignature: 'Transfer(address,address,uint256)',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    },
    {
      transactionIndex: 0,
      blockNumber: 18185072,
      transactionHash: '0xab08991ff8b8ea266c08a9424a299fc6c771da13d325e3247fc17ce845af6632',
      address: '0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe',
      topics: [Array],
      data: '0x0000000000000000000000000000000000000000000000000de0b6b3a76403d900000000000000000000000000000000000000000000000000038cfea3545bc900000000000000000000000000000000000000000000000000038cfea3545bc9',
      logIndex: 6,
      blockHash: '0xac4e64680f590288ad64339482f8673daceeb32e458d954b422b10b9b88dcec7',
      args: [Array],
      decode: [Function (anonymous)],
      event: 'IncreaseLiquidity',
      eventSignature: 'IncreaseLiquidity(uint256,uint128,uint256,uint256)',
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)]
    }
  ]
}
 */
