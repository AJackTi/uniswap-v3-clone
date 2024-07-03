const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

describe("swapExactInputMultihop", () => {
  let multiHopSwap;
  let accounts;
  let weth;
  let dai;
  // let usdc;

  before(async () => {
    accounts = await ethers.getSigners(1);

    const MultiHopSwap = await ethers.getContractFactory("SwapMultiHop");
    multiHopSwap = await MultiHopSwap.deploy();

    await multiHopSwap.deployed();

    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);
    // usdc = await ethers.getContractAt("IERC20", USDC);
  });

  it("swapExactInputMultihop", async () => {
    const amountIn = 10n ** 18n;

    await weth.deposit({ value: amountIn });
    await weth.approve(multiHopSwap.address, amountIn);

    try {
      await multiHopSwap.swapExactInputMultihop(amountIn);

      console.log("DAI Balance", await dai.balanceOf(accounts[0].address));
    } catch (error) {
      console.log(error.message); // This will help you identify the problem
    }
  });

  it("swapExactOutputMultihop", async () => {
    const wethAmountInMax = 10n ** 18n;
    const daiAmountOut = 100n * 10n ** 18n;

    await weth.deposit({ value: wethAmountInMax });
    await weth.approve(multiHopSwap.address, wethAmountInMax);

    await multiHopSwap.swapExactOutputMultihop(daiAmountOut, wethAmountInMax);
    console.log(accounts[0].address);
    // console.log(accounts[1].address);
  });
});
