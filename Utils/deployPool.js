import {
  BigNumber,
  ethers,
} from 'ethers';
import Web3Modal from 'web3modal';

require("dotenv").config();

const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// TODO: check it and delete if not working
const UNISWAP_V3_FACTORY_ADDRESS = "0xa9efDEf197130B945462163a0B852019BA529a66";
const NON_FUNGABLE_MANAGER = "0xD61210E756f7D71Cc4F74abF0747D65Ea9d7525b";
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

export const fetchPoolContract = (signerOrProvider) =>
  new ethers.Contract(
    process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
    artifacts.UniswapV3Factory.abi,
    signerOrProvider
  );

export const fetchPositionContract = (signerOrProvider) =>
  new ethers.Contract(
    process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    signerOrProvider
  );

const encodePriceSqrt = (reserve1, reserve0) => {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
};

export const connectingWithPoolContract = async (
  address1,
  address2,
  fee,
  tokenFee1,
  tokenFee2
) => {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  console.log("address1", address1);
  console.log("address2", address2);
  console.log("fee", fee);
  console.log("tokenFee1", tokenFee1);
  console.log("tokenFee2", tokenFee2);
  console.log("signer", signer);

  const createPoolContract = await fetchPositionContract(signer);

  console.log("createPoolContract", createPoolContract);

  const price = encodePriceSqrt(tokenFee1, tokenFee2);
  const transaction = await createPoolContract
    .connect(signer)
    .createAndInitializePoolIfNecessary(address1, address2, fee, price, {
      gasLimit: 30000000,
    });

  console.log("transaction:", transaction);
  await transaction.wait();

  const factory = await fetchPoolContract(signer);
  const poolAddress = await factory
    .connect(signer)
    .getPool(address1, address2, fee);

  return poolAddress;
};
