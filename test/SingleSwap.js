const { ethers } = require("hardhat");

// TODO: check it and delete if not working
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

describe("SingleSwap token", () => {
  let singleSwapToken;
  let accounts;
  let weth;
  let dai;
  let usdc;

  before(async () => {
    accounts = await ethers.getSigners(1);

    const SingleSwapToken = await ethers.getContractFactory("SingleSwapToken");
    singleSwapToken = await SingleSwapToken.deploy();

    await singleSwapToken.deployed();

    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);

    // console.log("weth:", weth);
    // console.log("dai:", dai);
    // console.log("usdc:", usdc);
  });

  it("swapExactInputSingle", async () => {
    const amountIn = 10n ** 18n;

    await weth.deposit({ value: amountIn });
    await weth.approve(singleSwapToken.address, amountIn);
    await singleSwapToken.swapExactInputSingle(amountIn);

    console.log("AI Balance: ", await dai.balanceOf(accounts[0].address));

    // console.log("weth:", weth);
    // console.log("dai:", dai);
    // console.log("usdc:", usdc);
    // console.log("accounts:", accounts);
    // console.log("singleSwapToken:", singleSwapToken);
  });

  it("swapSingleOutputSingle", async () => {
    const wethAmountInMax = 10n ** 18n;
    const daiAmountOut = 100n * 10n ** 18n;

    await weth.deposit({ value: wethAmountInMax });
    await weth.approve(singleSwapToken.address, wethAmountInMax);
    try {
      await singleSwapToken.swapExactOutputSingle(
        daiAmountOut,
        wethAmountInMax
      );
    } catch (error) {
      console.log(error.message); // This will help you identify the problem
    }

    console.log(accounts[0].address);
    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
  });
});
