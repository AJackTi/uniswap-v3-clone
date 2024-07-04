const TETHER_ADDRESS = process.env.TETHER_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const WRAPPED_BITCOIN_ADDRESS = process.env.WRAPPED_BITCOIN_ADDRESS;
const { Contract } = require("ethers");

const artifacts = {
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  WBTC: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json"),
};

async function main() {
  const [_owner, signer] = await ethers.getSigners();
  const provider = ethers.provider;

  console.log("Signer: ", signer.address);

  const usdcContract = new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider);
  const usdcBalanceOf = await usdcContract
    .connect(signer)
    .balanceOf(signer.address);

  const usdtContract = new Contract(
    TETHER_ADDRESS,
    artifacts.Usdt.abi,
    provider
  );
  const usdtBalanceOf = await usdtContract
    .connect(signer)
    .balanceOf(signer.address);

  const wBtcContract = new Contract(
    WRAPPED_BITCOIN_ADDRESS,
    artifacts.WBTC.abi,
    provider
  );
  const wBtcBalanceOf = await wBtcContract
    .connect(signer)
    .balanceOf(signer.address);

  console.log(
    "USDC Balance: ",
    ethers.utils.formatUnits(usdcBalanceOf, await usdcContract.decimals())
  );
  console.log(
    "USDT Balance: ",
    ethers.utils.formatUnits(usdtBalanceOf, await usdtContract.decimals())
  );
  console.log(
    "Wrapped Bitcoin Balance: ",
    ethers.utils.formatUnits(wBtcBalanceOf, await wBtcContract.decimals())
  );
}

/*
  npx hardhat run --network localhost scripts/getBalanceTokens.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
