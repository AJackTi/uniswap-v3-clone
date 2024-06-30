const { ContractFactory, utils } = require("ethers");
const WETH9 = require("../Context/WETH9.json");

const fs = require("fs");
const { promisify } = require("util");

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  WETH9,
  UserStorageData: require("../Context/UserStorageData.json"),
};

const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`);
      }
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2);
      linkReferences[fileName][contractName].forEach(({ start, length }) => {
        const start2 = 2 + start * 2;
        const length2 = length * 2;
        bytecode = bytecode
          .slice(0, start2)
          .concat(address)
          .concat(bytecode.slice(start2 + length2, bytecode.length));
      });
    });
  });
  return bytecode;
};

async function main() {
  const [owner] = await ethers.getSigners();

  const Weth = new ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    owner
  );
  let weth = await Weth.deploy();

  const Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    owner
  );
  let factory = await Factory.deploy();

  const SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner
  );
  let swapRouter = await SwapRouter.deploy(factory.address, weth.address);

  const NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    owner
  );
  let nftDescriptor = await NFTDescriptor.deploy();
  const LinkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1681,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    LinkedBytecode,
    owner
  );

  const NativeCurrencyLabelBytes = utils.formatBytes32String("WETH");
  let nonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptor.deploy(
      weth.address,
      NativeCurrencyLabelBytes
    );

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  let nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    factory.address,
    weth.address,
    nonfungibleTokenPositionDescriptor.address
  );

  const StoreUserData = new ContractFactory(
    artifacts.UserStorageData.abi,
    artifacts.UserStorageData.bytecode,
    owner
  );

  let storeUserData = await StoreUserData.deploy();

  let addresses = [
    `WETH_ADDRESS=${weth.address}`,
    `FACTORY_ADDRESS=${factory.address}`,
    `NEXT_PUBLIC_FACTORY_ADDRESS=${factory.address}`,
    `SWAP_ROUTER_ADDRESS=${swapRouter.address}`,
    `NFT_DESCRIPTOR_ADDRESS=${nftDescriptor.address}`,
    `POSITION_DESCRIPTOR_ADDRESS=${nonfungibleTokenPositionDescriptor.address}`,
    `POSITION_MANAGER_ADDRESS=${nonfungiblePositionManager.address}`,
    `NEXT_PUBLIC_POSITION_MANAGER_ADDRESS=${nonfungiblePositionManager.address}`,
    `STORE_USER_DATA_ADDRESS=${storeUserData.address}`,
    `NEXT_PUBLIC_STORE_USER_DATA_ADDRESS=${storeUserData.address}`,
  ];
  const data = addresses.join("\n");

  const writeFile = promisify(fs.writeFile);
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
npx hardhat run --network localhost scripts/01_deployContracts.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
