// npx hardhat run scripts/checkLiquidity.js --network localhost

const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const { Contract } = require("ethers");
const { Pool } = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");

const poolAddress = "0x4fc0f416Dc7676620C49F2e96FEBa9644E6865EA";

async function getPoolData(poolContract) {
  const [
    tickSpacing,
    fee,
    liquidity,
    slot0,
    factory,
    token0,
    token1,
    maxLiquidityPerTick,
  ] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
    poolContract.factory(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.maxLiquidityPerTick(),
  ]);

  const TokenA = new Token(3, token0, 18, "PINNU", "Parvesh");
  const TokenB = new Token(3, token1, 18, "PHLA", "Payal");

  const poolExample = new Pool(
    TokenA,
    TokenB,
    fee,
    slot0[0].toString(),
    liquidity.toString(),
    slot0[1]
  );

  return {
    factory,
    token0,
    token1,
    maxLiquidityPerTick,
    tickSpacing,
    fee,
    liquidity: liquidity.toString(),
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
    observationIndex: slot0[2],
    observationCardinality: slot0[3],
    observationCardinalitynext: slot0[4],
    feeProtocol: slot0[5],
    unlocked: slot0[6],
    poolExample,
  };
}

async function main() {
  const provider = waffle.provider;
  const poolContract = new Contract(poolAddress, UniswapV3Pool.abi, provider);
  const poolData = await getPoolData(poolContract);
  console.log("poolData", poolData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });

/**
   *
console.log("poolData", poolData);

{
  factory: '0x9f62EE65a8395824Ee0821eF2Dc4C947a23F0f25',
  token0: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
  token1: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
  maxLiquidityPerTick: BigNumber {
    _hex: '0x5e8b2285f864419ac400be907196',
    _isBigNumber: true
  },
  tickSpacing: 10,
  fee: 500,
  liquidity: '1000000000000000985',
  sqrtPriceX96: BigNumber {
    _hex: '0x01000000000000000000000000',
    _isBigNumber: true
  },
  tick: 0,
  observationIndex: 0,
  observationCardinality: 1,
  observationCardinalitynext: 1,
  feeProtocol: 0,
  unlocked: true,
  poolExample: Pool {
    token0: Token {
      chainId: 3,
      decimals: 18,
      symbol: 'PINNU',
      name: 'Parvesh',
      isNative: false,
      isToken: true,
      address: '0x8B64968F69E669faCc86FA3484FD946f1bBE7c91',
      buyFeeBps: undefined,
      sellFeeBps: undefined
    },
    token1: Token {
      chainId: 3,
      decimals: 18,
      symbol: 'PHLA',
      name: 'Payal',
      isNative: false,
      isToken: true,
      address: '0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b',
      buyFeeBps: undefined,
      sellFeeBps: undefined
    },
    fee: 500,
    sqrtRatioX96: JSBI(4) [ 0, 0, 0, 64, sign: false ],
    liquidity: JSBI(2) [ 660866009, 931322574, sign: false ],
    tickCurrent: 0,
    tickDataProvider: NoTickDataProvider {}
  }
}
   */
