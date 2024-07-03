require("dotenv").config();
const { Contract } = require("ethers");

const USDC = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const TETHER_ADDRESS = process.env.TETHER_ADDRESS;
const SINGLE_SWAP_TOKEN_ADDRESS = process.env.SINGLE_SWAP_TOKEN_ADDRESS;
const WETH_ADDRESS = process.env.WETH_ADDRESS;

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  SingleSwapToken: require("../Context/SingleSwapToken.json"),
  WETH9: require("../Context/WETH9.json"),
};

async function main() {
  let [owner, signer] = await ethers.getSigners();
  let token2 = await ethers.getContractAt("IERC20", USDC);
  let token1 = await ethers.getContractAt("IERC20", TETHER_ADDRESS);
  let weth9Contract = await new ethers.Contract(
    WETH_ADDRESS,
    artifacts.WETH9.abi,
    signer
  );

  console.log("weth9Contract", weth9Contract.address);

  let swapAmount = 10;
  console.log("swapAmount: ", swapAmount);

  console.log("token 1: ", token1.address);
  console.log("token 2: ", token2.address);

  let singleSwapToken = new ethers.Contract(
    SINGLE_SWAP_TOKEN_ADDRESS,
    artifacts.SingleSwapToken.abi,
    signer
  );

  console.log("singleSwapToken", singleSwapToken.address);
  console.log("Address:", signer.address);

  console.log(
    "Before Swap USDT Token Balance: ",
    await token1.balanceOf(signer.address)
  );
  console.log(
    "Before Swap USDC Token Balance: ",
    await token2.balanceOf(signer.address)
  );
  console.log(
    "Before Swap WETH Token Balance: ",
    await weth9Contract.balanceOf(signer.address)
  );

  // Swap
  try {
    const decimals0 = 18;
    const inputAmount = swapAmount;
    const amountIn = ethers.utils.parseUnits(inputAmount.toString(), decimals0);
    console.log("amountIn: ", amountIn);

    await weth9Contract.deposit({ value: amountIn });
    await weth9Contract.approve(singleSwapToken.address, amountIn);

    const transaction = await singleSwapToken.swapExactInputSingle(
      token1.address,
      token2.address,
      amountIn,
      {
        gasLimit: 300000,
      }
    );

    await transaction.wait();
    console.log("Transaction:", transaction);
  } catch (error) {
    console.log("Error", error);
  }

  console.log(
    "After Swap USDT Token Balance: ",
    await token1.balanceOf(signer.address)
  );
  console.log(
    "After Swap USDC Token Balance: ",
    await token2.balanceOf(signer.address)
  );
  console.log(
    "After Swap WETH Token Balance: ",
    await weth9Contract.balanceOf(signer.address)
  );

  /*
  npx hardhat run --network localhost scripts/SingleSwap.js
*/
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
