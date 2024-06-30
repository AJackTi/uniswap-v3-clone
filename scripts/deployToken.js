// npx hardhat run scripts/deployToken.js --network localhost

async function main() {
  const [owner] = await ethers.getSigners();

  const Parvesh = await ethers.getContractFactory("Parvesh");
  const parvesh = await Parvesh.deploy();

  const Payal = await ethers.getContractFactory("Payal");
  const payal = await Payal.deploy();

  const Jiyanshi = await ethers.getContractFactory("Jiyanshi");
  const jiyanshi = await Jiyanshi.deploy();

  console.log("parveshAddress = ", parvesh.address);
  console.log("payalAddress = ", payal.address);
  console.log("jiyanshiAddress = ", jiyanshi.address);
}

/**
 *
parveshAddress = "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92";
payalAddress = "0x68d2Ecd85bDEbfFd075Fb6D87fFD829AD025DD5C";
jiyanshiAddress = "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33";

 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
