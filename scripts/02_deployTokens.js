const fs = require("fs");
const { promisify } = require("util");
//
async function main() {
  const [owner, signer2] = await ethers.getSigners();

  const Tether = await ethers.getContractFactory("Tether", owner);
  const tether = await Tether.deploy();

  const Usdc = await ethers.getContractFactory("UsdCoin", owner);
  const usdc = await Usdc.deploy();

  const WrappedBitcoin = await ethers.getContractFactory(
    "WrappedBitcoin",
    owner
  );
  const wrappedBitcoin = await WrappedBitcoin.deploy();

  await tether
    .connect(owner)
    .mint(signer2.address, ethers.utils.parseEther("100000"));
  await usdc
    .connect(owner)
    .mint(signer2.address, ethers.utils.parseEther("100000"));
  await wrappedBitcoin
    .connect(owner)
    .mint(signer2.address, ethers.utils.parseEther("100000"));

  let addresses = [
    `USDC_ADDRESS=${usdc.address}`,
    `NEXT_PUBLIC_USDC_ADDRESS=${usdc.address}`,
    `TETHER_ADDRESS=${tether.address}`,
    `NEXT_PUBLIC_TETHER_ADDRESS=${tether.address}`,
    `WRAPPED_BITCOIN_ADDRESS=${wrappedBitcoin.address}`,
    `NEXT_PUBLIC_WRAPPED_BITCOIN_ADDRESS=${wrappedBitcoin.address}`,
  ];
  const data = "\n" + addresses.join("\n");

  // tether.connect(owner).balanceOf(signer2.address);

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

/*
  npx hardhat run --network localhost scripts/02_deployTokens.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
