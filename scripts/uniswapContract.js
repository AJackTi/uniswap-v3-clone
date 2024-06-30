// npx hardhat run scripts/uniswapContract.js --network localhost
const { Contract, ContractFactory, utils, BigNumber } = require("ethers");
const WETH9 = require("./../Context/WETH9.json");

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  WETH9,
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

  const weth = await Weth.deploy();

  const Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    owner
  );

  const factory = await Factory.deploy();

  const SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner
  );

  const swapRouter = await SwapRouter.deploy(factory.address, weth.address);

  const NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    owner
  );

  const nftDescriptor = await NFTDescriptor.deploy();

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
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
    linkedBytecode,
    owner
  );

  const nonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptor.deploy(weth.address);
  console.log(
    "nonfungibleTokenPositionDescriptor",
    nonfungibleTokenPositionDescriptor
  );

  const NonfungiblePositionManger = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );

  const nonfungiblePositionManger = await NonfungiblePositionManger.deploy(
    factory.address,
    weth.address,
    nonfungibleTokenPositionDescriptor.address
  );

  console.log("WETHAddress = ", weth.address);
  console.log("factoryAddress = ", factory.address);
  console.log("swapRouterAddress = ", swapRouter.address);
  console.log("nftDescriptorAddress = ", nftDescriptor.address);
  console.log(
    "nonfungibleTokenPositionDescriptorAddress = ",
    nonfungibleTokenPositionDescriptor.address
  );
  console.log(
    "nonfungiblePositionMangerAddress = ",
    nonfungiblePositionManger.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Error", error);
    exit(1);
  });
