import React, { useState, useEffect, createContext } from "react";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { getPrice } from "./../Utils/fetchingPrice";
import { swapUpdatePrice } from "./../Utils/swapUpdatePrice";
import { addLiquidityExternal } from "./../Utils/addLiquidity";
import { getLiquidityData } from "./../Utils/checkLiquidity";
import { connectingWithPoolContract } from "./../Utils/deployPool";
import {
  BooTokenAddress,
  LifeTokenAddress,
  IWETHAddress,
  IWETHABI,
  UserStorageDataAddress,
} from "./constants";

import {
  checkIfWalletConnected,
  connectWallet,
  connectingWithBooToken,
  connectingWithLifeToken,
  connectingWithSingleSwapToken,
  connectingWithSwapMultiHopToken,
  connectingWithIWETHToken,
  connectingWithDaiToken,
  connectingWithUserStorageDataContract,
} from "./../Utils/appFeatures";

import ERC20 from "./ERC20.json";

const SwapTokenContext = createContext({});

const SwapTokenContextProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [ether, setEther] = useState("");
  const [networkConnected, setNetworkConnected] = useState("");
  const [weth9, setWeth9] = useState("");
  const [dai, setDai] = useState("");
  const [tokenData, setTokenData] = useState([]);
  const [getAllLiquidity, setGetAllLiquidity] = useState([]);

  // BooToken Token deployed to 0xbFD3c8A956AFB7a9754C951D03C9aDdA7EC5d638
  // ERC20Life Token deployed to 0x38F6F2caE52217101D7CA2a5eC040014b4164E6C
  // SingleSwapToken Token deployed to 0xc075BC0f734EFE6ceD866324fc2A9DBe1065CBB1
  // SwapMultiHop Token deployed to 0x837a41023CF81234f89F956C94D676918b4791c1

  // const addToken = [BooTokenAddress, LifeTokenAddress, IWETHAddress];
  // const addToken = [
  //   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  //   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  //   "0x9534ad65fb398E27Ac8F4251dAe1780B989D136e",
  //   "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  //   "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
  //   "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
  //   "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  //   "0x163f8C2467924be0ae7B5347228CABF260318753",
  //   "0xd1d2Eb1B1e90B638588728b4130137D262C87cae",
  //   "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
  //   "0x4a220E6096B25EADb88358cb44068A3248254675",
  //   "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  // ];
  const addToken = [
    "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92",
    "0x68d2Ecd85bDEbfFd075Fb6D87fFD829AD025DD5C",
    "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33",
  ];

  const fetchingData = async () => {
    try {
      // Get User Account
      const userAccount = await checkIfWalletConnected();
      setAccount(userAccount);

      // Create provider
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      console.log("connection", connection);
      console.log("ethers", ethers);

      const provider = new ethers.providers.Web3Provider(connection);

      const balance = await provider.getBalance(userAccount);
      const convertedBigInt = BigNumber.from(balance).toString();
      // console.log(balance);
      const convertedEth = ethers.utils.formatEther(convertedBigInt);

      setEther(convertedEth);
      console.log("convertedEth", convertedEth);

      const network = await provider.getNetwork();
      console.log("network", network);
      setNetworkConnected(network.name);

      let tokensTemp = [];
      addToken.map(async (token, idx) => {
        const contract = new ethers.Contract(token, ERC20.abi, provider);
        console.log("contract : ", contract);

        const userBalance = await contract.balanceOf(userAccount);
        const tokenLeft = BigNumber.from(userBalance).toString();
        const convertokenBalance = ethers.utils.formatEther(tokenLeft);

        const symbol = await contract.symbol();
        const name = await contract.name();

        tokensTemp.push({
          symbol,
          name,
          balance: convertokenBalance,
          address: token,
        });

        console.log("userBalance : ", userBalance);
        console.log("convertokenBalance : ", convertokenBalance);
        console.log("symbol : ", symbol);
        console.log("name : ", name);
      });

      setTokenData(tokensTemp);
      console.log("tokensTemp : ", tokensTemp);

      // GET LIQUIDITY
      const userStorageData = await connectingWithUserStorageDataContract();
      const userLiquidity = await userStorageData.getAllTransactions();
      console.log("userLiquidity", userLiquidity);

      let userLiquidityTemp = [];
      userLiquidity.map(async (el, i) => {
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
      // const convertedweth9TokenBalance = ethers.utils.formatEther(weth9Token);
      // setWeth9(convertedweth9TokenBalance);
      // console.log("weth9 State : ", convertedweth9TokenBalance);
    } catch (error) {
      console.log("An error occured", error);
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
          gasLimit: 500000,
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
  /**
   * 
    console.log("tokenAddress0: ", tokenAddress0);
    tokenAddress0:  0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92

    console.log("tokenAddress1: ", tokenAddress1);
    tokenAddress1:  0x9D3999af03458c11C78F7e6C0fAE712b455D4e33

    console.log("fee: ", fee);
    fee:  3000

    console.log("tokenPrice1: ", tokenPrice1);
    tokenPrice1:  1

    console.log("tokenPrice2: ", tokenPrice2);
    tokenPrice2:  1

    console.log("slippage: ", slippage);
    slippage:  25

    console.log("deadline: ", deadline);
    deadline:  10

    console.log("tokenAmountOne: ", tokenAmountOne);
    tokenAmountOne:  200

    console.log("tokenAmountTwo: ", tokenAmountTwo);
    tokenAmountTwo:  200
 
    console.log("createPool: ", createPool);
    createPool:  0x4AA2E838a6555A4F8D5380E1B4ED96Cb0588b742

    console.log("Info", info);
    {
        "to": "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb",
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "contractAddress": null,
        "transactionIndex": 0,
        "gasUsed": {
            "type": "BigNumber",
            "hex": "0x096be7"
        },
        "logsBloom": "0x0000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000024000000000000000200400000000800000000000000000004000002000000000000000000000002000004020000090000080000000100081000000000001000000000000000000c000000000000000000000000000200000000000000000020000000020000000000000000000002000002000000000000004000000000000000000000000002000000200000080000000000000000002000000000000400000060000010000000000000800000001000040000001000041000000040000080000800",
        "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a",
        "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
        "logs": [
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b742"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 0,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92",
                "topics": [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab"
                ],
                "data": "0x00000000000000000000000000000000000000000000000ad7797bfeebc53121",
                "logIndex": 1,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b742"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 2,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33",
                "topics": [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab"
                ],
                "data": "0x00000000000000000000000000000000000000000000000ad7797bfeebc53121",
                "logIndex": 3,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x4AA2E838a6555A4F8D5380E1B4ED96Cb0588b742",
                "topics": [
                    "0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab",
                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff88",
                    "0x0000000000000000000000000000000000000000000000000000000000000078"
                ],
                "data": "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab0000000000000000000000000000000000000000000000000de0b6b3a76400430000000000000000000000000000000000000000000000000015405bda5acedf0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 4,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                "data": "0x",
                "logIndex": 5,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb",
                "topics": [
                    "0x3067048beee31b25b2f1681f88dac838c8bba36af25bfb2b7cf7473a5847e35f",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a76400430000000000000000000000000000000000000000000000000015405bda5acedf0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 6,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            }
        ],
        "blockNumber": 18217841,
        "confirmations": 1,
        "cumulativeGasUsed": {
            "type": "BigNumber",
            "hex": "0x096be7"
        },
        "effectiveGasPrice": {
            "type": "BigNumber",
            "hex": "0x5b40cb85"
        },
        "status": 1,
        "type": 2,
        "byzantium": true,
        "events": [
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b742"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 0,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x6Da3D07a6BF01F02fB41c02984a49B5d9Aa6ea92",
                "topics": [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab"
                ],
                "data": "0x00000000000000000000000000000000000000000000000ad7797bfeebc53121",
                "logIndex": 1,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b742"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 2,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x9D3999af03458c11C78F7e6C0fAE712b455D4e33",
                "topics": [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab"
                ],
                "data": "0x00000000000000000000000000000000000000000000000ad7797bfeebc53121",
                "logIndex": 3,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0x4AA2E838a6555A4F8D5380E1B4ED96Cb0588b742",
                "topics": [
                    "0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde",
                    "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab",
                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff88",
                    "0x0000000000000000000000000000000000000000000000000000000000000078"
                ],
                "data": "0x000000000000000000000000a8d297d643a11ce83b432e87eebce6bee0fd2bab0000000000000000000000000000000000000000000000000de0b6b3a76400430000000000000000000000000000000000000000000000000015405bda5acedf0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 4,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb",
                "topics": [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                "data": "0x",
                "logIndex": 5,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a",
                "args": [
                    "0x0000000000000000000000000000000000000000",
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    {
                        "type": "BigNumber",
                        "hex": "0x01"
                    }
                ],
                "event": "Transfer",
                "eventSignature": "Transfer(address,address,uint256)"
            },
            {
                "transactionIndex": 0,
                "blockNumber": 18217841,
                "transactionHash": "0x8f465dc4b4fce6c4f3d314313dc27a6898b09ca47d6be696265091564dd13e82",
                "address": "0xa8d297D643a11cE83b432e87eEBce6bee0fd2bAb",
                "topics": [
                    "0x3067048beee31b25b2f1681f88dac838c8bba36af25bfb2b7cf7473a5847e35f",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a76400430000000000000000000000000000000000000000000000000015405bda5acedf0000000000000000000000000000000000000000000000000015405bda5acedf",
                "logIndex": 6,
                "blockHash": "0x176537c59027d89cbca136f02e804e9b8255eb6e74f7fb2754e3b3eea0abf77a",
                "args": [
                    {
                        "type": "BigNumber",
                        "hex": "0x01"
                    },
                    {
                        "type": "BigNumber",
                        "hex": "0x0de0b6b3a7640043"
                    },
                    {
                        "type": "BigNumber",
                        "hex": "0x15405bda5acedf"
                    },
                    {
                        "type": "BigNumber",
                        "hex": "0x15405bda5acedf"
                    }
                ],
                "event": "IncreaseLiquidity",
                "eventSignature": "IncreaseLiquidity(uint256,uint128,uint256,uint256)"
            }
        ]
    }


    console.log("userStorageData", userStorageData);
    {
        "hash": "0x531fe01d79776fe6a7132f529d349ae82be1cab74c7c028a352ac8167e3c4765",
        "type": 2,
        "accessList": null,
        "blockHash": null,
        "blockNumber": null,
        "transactionIndex": null,
        "confirmations": 0,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gasPrice": {
            "type": "BigNumber",
            "hex": "0x5b9f5139"
        },
        "maxPriorityFeePerGas": {
            "type": "BigNumber",
            "hex": "0x59682f00"
        },
        "maxFeePerGas": {
            "type": "BigNumber",
            "hex": "0x5b9f5139"
        },
        "gasLimit": {
            "type": "BigNumber",
            "hex": "0x020a86"
        },
        "to": "0xc4Fe39a1588807CfF8d8897050c39F065eBAb0B8",
        "value": {
            "type": "BigNumber",
            "hex": "0x00"
        },
        "nonce": 573,
        "data": "0x890cb4e90000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b7420000000000000000000000006da3d07a6bf01f02fb41c02984a49b5d9aa6ea920000000000000000000000009d3999af03458c11c78f7e6c0fae712b455d4e33",
        "r": "0xcae5644da30a2994e6ed3dd5a0af6ec160afa452c01f555c8a05ba7f2722d2aa",
        "s": "0x0ab245abd328beca6ee7e0cd31fe37e130c2f191f4a2487f78590a37e9344594",
        "v": 0,
        "creates": null,
        "chainId": 0
    }


    console.log("userLiquidity", userLiquidity);
    {
        "hash": "0x531fe01d79776fe6a7132f529d349ae82be1cab74c7c028a352ac8167e3c4765",
        "type": 2,
        "accessList": null,
        "blockHash": null,
        "blockNumber": null,
        "transactionIndex": null,
        "confirmations": 0,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gasPrice": {
            "type": "BigNumber",
            "hex": "0x5b9f5139"
        },
        "maxPriorityFeePerGas": {
            "type": "BigNumber",
            "hex": "0x59682f00"
        },
        "maxFeePerGas": {
            "type": "BigNumber",
            "hex": "0x5b9f5139"
        },
        "gasLimit": {
            "type": "BigNumber",
            "hex": "0x020a86"
        },
        "to": "0xc4Fe39a1588807CfF8d8897050c39F065eBAb0B8",
        "value": {
            "type": "BigNumber",
            "hex": "0x00"
        },
        "nonce": 573,
        "data": "0x890cb4e90000000000000000000000004aa2e838a6555a4f8d5380e1b4ed96cb0588b7420000000000000000000000006da3d07a6bf01f02fb41c02984a49b5d9aa6ea920000000000000000000000009d3999af03458c11c78f7e6c0fae712b455d4e33",
        "r": "0xcae5644da30a2994e6ed3dd5a0af6ec160afa452c01f555c8a05ba7f2722d2aa",
        "s": "0x0ab245abd328beca6ee7e0cd31fe37e130c2f191f4a2487f78590a37e9344594",
        "v": 0,
        "creates": null,
        "chainId": 0
    }
   */

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

      await weth9Contract.deposite({ value: amountIn });
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
