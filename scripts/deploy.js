// npx hardhat run scripts/deploy.js --network localhost

const hre = require("hardhat");

async function main() {
  // Deployment: BooToken
  // const BooToken = await hre.ethers.getContractFactory("BooToken");
  // const booToken = await BooToken.deploy();

  // await booToken.deployed();

  // console.log(`BooToken Token deployed to ${booToken.address}`);

  // Deployment: ERC20Life
  // const ERC20Life = await hre.ethers.getContractFactory("ERC20Life");
  // const erc20Life = await ERC20Life.deploy();

  // await erc20Life.deployed();

  // console.log(`ERC20Life Token deployed to ${erc20Life.address}`);

  // Deployment: SingleSwapToken
  // const SingleSwapToken = await hre.ethers.getContractFactory(
  //   "SingleSwapToken"
  // );
  // const singleSwapToken = await SingleSwapToken.deploy();

  // await singleSwapToken.deployed();

  // console.log(`SingleSwapToken Token deployed to ${singleSwapToken.address}`);

  // Deployment: SingleSwapToken
  const StoreUserData = await hre.ethers.getContractFactory("UserStorageData");
  const storeUserData = await StoreUserData.deploy();

  await storeUserData.deployed();

  console.log(`UserStorageDataAddress = '${storeUserData.address}'`);

  // Deployment: SwapMultiHop
  // const SwapMultiHop = await hre.ethers.getContractFactory("SwapMultiHop");
  // const swapMultiHop = await SwapMultiHop.deploy();

  // await swapMultiHop.deployed();

  // console.log(`SwapMultiHop Token deployed to ${swapMultiHop.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
