require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-ignition");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  paths: {
    tests: "./test",
  },
};
