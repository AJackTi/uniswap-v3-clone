import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import {
  BooTokenABI,
  BooTokenAddress,
  IWETHABI,
  IWETHAddress,
  LifeTokenABI,
  LifeTokenAddress,
  SingleSwapTokenABI,
  SingleSwapTokenAddress,
  SwapMultiHopABI,
  SwapMultiHopAddress,
  UserStorageDataABI,
} from '../Context/constants';

const path = require("path");

require("dotenv").config({
  path: path.resolve(".env"),
});

const UserStorageDataAddress = process.env.NEXT_PUBLIC_STORE_USER_DATA_ADDRESS;

//CHECK IF WALLET IS CONNECT
export const checkIfWalletConnected = async () => {
  try {
    if (!window.ethereum) return console.log("Install MetaMask");
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    const firstAccount = accounts[0];
    return firstAccount;
  } catch (error) {
    console.log(error);
  }
};

//CONNECT WALLET
export const connectWallet = async () => {
  try {
    if (!window.ethereum) return console.log("Install MetaMask");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const firstAccount = accounts[0];
    return firstAccount;
  } catch (error) {
    console.log(error);
  }
};

//FETCHING CONTRACT------------------------

//BOO TOKEN FETCHING
export const fetchBooContract = (signerOrProvider) =>
  new ethers.Contract(BooTokenAddress, BooTokenABI, signerOrProvider);

//CONNECTING With BOO TOKEN CONTRACT
export const connectingWithBooToken = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchBooContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//FETCHING CONTRACT------------------------

//LIFE TOKEN FETCHING
export const fetchLifeContract = (signerOrProvider) =>
  new ethers.Contract(LifeTokenAddress, LifeTokenABI, signerOrProvider);

//CONNECTING With LIFE TOKEN CONTRACT
export const connectingWithLIfeToken = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchLifeContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//FETCHING CONTRACT------------------------

//SingleSwapToken TOKEN FETCHING
export const fetchSingleSwapContract = (signerOrProvider) =>
  new ethers.Contract(
    SingleSwapTokenAddress,
    SingleSwapTokenABI,
    signerOrProvider
  );

//CONNECTING With SingleSwapToken TOKEN CONTRACT
export const connectingWithSingleSwapToken = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchSingleSwapContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//FETCHING CONTRACT------------------------

//IWETH TOKEN FETCHING
export const fetchIWETHContract = (signerOrProvider) =>
  new ethers.Contract(IWETHAddress, IWETHABI, signerOrProvider);

//CONNECTING With SingleSwapToken TOKEN CONTRACT
export const connectingWithIWETHToken = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchIWETHContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//FETCHING CONTRACT------------------------

// TODO: check it and delete if not working
// IWETH TOKEN FETCHING
const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const fetchDAIContract = (signerOrProvider) =>
  new ethers.Contract(DAIAddress, IWETHABI, signerOrProvider);

//CONNECTING With SingleSwapToken TOKEN CONTRACT
export const connectingWithDAIToken = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchDAIContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//USER CONTRACT CONNECTION---------
export const fetchUserStorageContract = (signerOrProvider) =>
  new ethers.Contract(
    UserStorageDataAddress,
    userStorageDataABI,
    signerOrProvider
  );

//CONNECTING With SingleSwapToken TOKEN CONTRACT
export const connectingWithUserStorageContract = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchUserStorageContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

//NEW MULTIHOP
export const fetchMultiHopContract = (signerOrProvider) =>
  new ethers.Contract(SwapMultiHopAddress, SwapMultiHopABI, signerOrProvider);

//CONNECTING With SingleSwapToken TOKEN CONTRACT
export const connectingWithMultiHopContract = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchMultiHopContract(signer);
    return contract;
  } catch (error) {
    console.log(error);
  }
};

/**
 * This function is used to fetch UserStorageData contract
 *
 * @param {} signerOrProvider
 * @returns
 */
export const fetchUserStorageDataContract = (signerOrProvider) => {
  return new ethers.Contract(
    UserStorageDataAddress,
    UserStorageDataABI,
    signerOrProvider
  );
};

// Connect with UserStorageData contract
export const connectingWithUserStorageDataContract = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchUserStorageDataContract(signer);

    return contract;
  } catch (error) {
    console.log("An error occurred", error);
  }
};
