async function main() {
  const [deployer] = await ethers.getSigners();
  // Get the contract factory
  const LiquidityExampleContract = await ethers.getContractFactory(
    "LiquidityExamples"
  );

  // Deploy the contract
  const liquidityExampleContract = await LiquidityExampleContract.deploy();

  console.log("Liquidity deployed to:", liquidityExampleContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
