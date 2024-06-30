import booToken from './BooToken.json';
import lifeToken from './ERC20Life.json';
import IWETH from './IWETH.json';
import singleSwapToken from './SingleSwapToken.json';
import swapMultiHop from './SwapMultiHop.json';
import userStorageData from './UserStorageData.json';

const path = require("path");

require("dotenv").config({
  path: path.resolve(".env"),
});

export const BooTokenAddress = process.env.NEXT_PUBLIC_BOO_TOKEN_ADDRESS || "";
export const BooTokenABI = booToken.abi;

export const LifeTokenAddress =
  process.env.NEXT_PUBLIC_LIFE_TOKEN_ADDRESS || "";
export const LifeTokenABI = lifeToken.abi;

export const SingleSwapTokenAddress =
  process.env.NEXT_PUBLIC_SINGLE_SWAP_TOKEN_ADDRESS || "";
export const SingleSwapTokenABI = singleSwapToken.abi;

export const SwapMultiHopAddress =
  process.env.NEXT_PUBLIC_SWAP_MULTI_HOP_ADDRESS || "";
export const SwapMultiHopABI = swapMultiHop.abi;

export const IWETHAddress = process.env.NEXT_PUBLIC_IWETH_ADDRESS || "";
export const IWETHABI = IWETH.abi;

export const UserStorageDataABI = userStorageData.abi;
