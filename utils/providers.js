/**
 * @dev This file contains the providers for the different networks
 */

const web3 = require("web3");

const bsc = new web3(
  "https://rpc.ankr.com/bsc"
);

const eth = new web3(

    "https://rpc.ankr.com/eth"

);

const polygon = new web3(
  "https://rpc-mainnet.maticvigil.com/"
);

module.exports = { bsc, eth, polygon };
