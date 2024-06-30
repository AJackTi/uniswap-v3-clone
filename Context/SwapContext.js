import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import {
  BigNumber,
  ethers,
} from 'ethers';
import Web3Modal from 'web3modal';

import { addLiquidityExternal } from '../Utils/addLiquidity';
import {
  checkIfWalletConnected,
  connectingWithDaiToken,
  connectingWithIWETHToken,
  connectingWithSingleSwapToken,
  connectingWithUserStorageDataContract,
  connectWallet,
} from '../Utils/appFeatures';
import { getLiquidityData } from '../Utils/checkLiquidity';
import { connectingWithPoolContract } from '../Utils/deployPool';
import { getPrice } from '../Utils/fetchingPrice';
import { swapUpdatePrice } from '../Utils/swapUpdatePrice';
import ERC20 from './ERC20.json';

const path = require("path");

require("dotenv").config({
  path: path.resolve(".env"),
});

export const SwapTokenContext = createContext({});

const SwapTokenContextProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [ether, setEther] = useState("");
  const [networkConnected, setNetworkConnected] = useState("");
  const [weth9, setWeth9] = useState("");
  const [dai, setDai] = useState("");
  const [tokenData, setTokenData] = useState([]);
  const [getAllLiquidity, setGetAllLiquidity] = useState([]);

  //TOP TOKENS
  const [topTokensList, setTopTokensList] = useState([]);

  const TETHER_ADDRESS = process.env.NEXT_PUBLIC_TETHER_ADDRESS;
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  const WRAPPED_BITCOIN_ADDRESS =
    process.env.NEXT_PUBLIC_WRAPPED_BITCOIN_ADDRESS;

  const addToken = [TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS];

  const fetchingData = async () => {
    try {
      // Get User Account
      const userAccount = await checkIfWalletConnected();
      setAccount(userAccount);

      // Create provider
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();

      const provider = new ethers.providers.Web3Provider(connection);

      const balance = await provider.getBalance(userAccount);
      const convertedBigInt = BigNumber.from(balance).toString();
      // console.log(balance);
      const convertedEth = ethers.utils.formatEther(convertedBigInt);

      setEther(convertedEth);

      const network = await provider.getNetwork();
      setNetworkConnected(network.name);

      let tokensTemp = [];
      addToken.map(async (_token, idx) => {
        const contract = new ethers.Contract(
          addToken[idx],
          ERC20.abi,
          provider
        );

        const userBalance = await contract.balanceOf(userAccount);
        const tokenLeft = BigNumber.from(userBalance).toString();
        const convertedTokenBalance = ethers.utils.formatEther(tokenLeft);

        const symbol = await contract.symbol();
        const name = await contract.name();

        tokensTemp.push({
          symbol,
          name,
          balance: convertedTokenBalance,
          address: addToken[idx],
        });
      });

      setTokenData(tokensTemp);
      console.log("tokensTemp : ", tokensTemp);

      // GET LIQUIDITY
      const userStorageData = await connectingWithUserStorageDataContract();
      if (!userStorageData) {
        return;
      }
      console.log("userStorageData", userStorageData);
      const userLiquidity = await userStorageData.getAllTransactions();
      console.log("userLiquidity", userLiquidity);

      let userLiquidityTemp = [];
      userLiquidity?.map(async (el, _i) => {
        const liquidityData = await getLiquidityData(
          el.poolAddress,
          el.tokenAddress0,
          el.tokenAddress1
        );
        userLiquidityTemp.push(liquidityData);
      });
      console.log("userLiquidityTemp", userLiquidityTemp);
      setGetAllLiquidity(userLiquidityTemp);
      // DAI Balance
      // const daiContract = await connectingWithDaiToken();
      // const daiBalance = await daiContract.balanceOf(userAccount);
      // const daiToken = BigNumber.from(daiBalance).toString();
      // const convertedDaiTokenBalance = ethers.utils.formatEther(daiToken);
      // setDai(convertedDaiTokenBalance);
      // console.log("dai State : ", convertedDaiTokenBalance);

      // WETH9 Balance
      // const weth9Contract = await connectingWithDaiToken();
      // const weth9Balance = await weth9Contract.balanceOf(userAccount);
      // const weth9Token = BigNumber.from(weth9Balance).toString();
      // const convertedWeth9TokenBalance = ethers.utils.formatEther(weth9Token);
      // setWeth9(convertedWeth9TokenBalance);
      // console.log("weth9 State : ", convertedWeth9TokenBalance);
    } catch (error) {
      console.log("An error occurred", error);
    }
  };

  useEffect(() => {
    fetchingData();
  }, []);
  const createLiquidityAndPool = async ({
    tokenAddress0,
    tokenAddress1,
    fee,
    tokenPrice1,
    tokenPrice2,
    slippage,
    deadline,
    tokenAmountOne,
    tokenAmountTwo,
  }) => {
    try {
      console.log("tokenAddress0: ", tokenAddress0);
      console.log("tokenAddress1: ", tokenAddress1);
      console.log("fee: ", fee);
      console.log("tokenPrice1: ", tokenPrice1);
      console.log("tokenPrice2: ", tokenPrice2);
      console.log("slippage: ", slippage);
      console.log("deadline: ", deadline);
      console.log("tokenAmountOne: ", tokenAmountOne);
      console.log("tokenAmountTwo: ", tokenAmountTwo);

      const createPool = await connectingWithPoolContract(
        tokenAddress0,
        tokenAddress1,
        fee,
        tokenPrice1,
        tokenPrice2,
        {
          gasLimit: 50000000,
        }
      );
      console.log("createPool: ", createPool);

      // CREATE LIQUIDITY
      const info = await addLiquidityExternal(
        tokenAddress0,
        tokenAddress1,
        createPool,
        fee,
        tokenAmountOne,
        tokenAmountTwo
      );

      console.log("Info", info);

      // ADD DATA

      const userStorageData = await connectingWithUserStorageDataContract();
      console.log("userStorageData", userStorageData);
      const userLiquidity = await userStorageData.addToBlockchain(
        createPool,
        tokenAddress0,
        tokenAddress1
      );
      console.log("userLiquidity", userLiquidity);
    } catch (error) {
      console.log("error", error);
    }
  };

  const singleSwapToken = async ({ token1, token2, swapAmount }) => {
    console.log("token 1: ", token1.address);
    console.log("token 2: ", token2.address);
    console.log("swapAmount: ", swapAmount);
    try {
      let singleSwapToken;
      let weth9Contract;
      let daiContract;

      singleSwapToken = await connectingWithSingleSwapToken();
      console.log("singleSwapToken", singleSwapToken);

      weth9Contract = await connectingWithIWETHToken();
      console.log("weth9Contract", weth9Contract);

      daiContract = await connectingWithDaiToken();
      console.log("daiContract", daiContract);

      // const amountIn = 10n ** 18n;
      const decimals0 = 18;
      const inputAmount = swapAmount;
      const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals0
      );

      console.log("amountIn: ", amountIn);

      await weth9Contract.deposit({ value: amountIn });
      await weth9Contract.approve(singleSwapToken.address, amountIn);

      console.log("Transaction reaches 164");
      const transaction = await singleSwapToken.swapExactInputSingle(
        token1.address,
        token2.address,
        amountIn,
        {
          gasLimit: 300000,
        }
      );

      await transaction.wait();
      console.log("Transaction reaches 175");

      const balance = await daiContract.balanceOf(account);
      console.log("balance: ", balance);

      const transferAmount = BigNumber.from(balance).toString();
      console.log("transferAmount: ", transferAmount);

      const ethValue = ethers.utils.formatEther(transferAmount);
      console.log("ethValue", ethValue);

      setDai(ethValue);
    } catch (error) {
      console.log("Error", error);
    }
  };

  // useEffect(() => {
  //   singleSwapToken();
  // }, [singleSwapToken]);

  return (
    <SwapTokenContext.Provider
      value={{
        tokenName: "Parvesh",
        connectWallet,
        account,
        networkConnected,
        ether,
        weth9,
        dai,
        tokenData,
        singleSwapToken,
        getPrice,
        swapUpdatePrice,
        getAllLiquidity,
        createLiquidityAndPool,
      }}
    >
      {children}
    </SwapTokenContext.Provider>
  );
};

export { SwapTokenContext as default, SwapTokenContextProvider };
