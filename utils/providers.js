/**
 * @dev This file contains the providers for the different networks
 */

const web3 = require("web3");

const bsc = new web3(
  "https://thrilling-green-dawn.bsc.discover.quiknode.pro/bfa1dcba97e594cf960398bee14d82229ccd57b9/"
);

const eth = new web3(

    "https://multi-dimensional-glitter.discover.quiknode.pro/fa76eedb7480f2b9b29497d2b1c04a2414dbdd3b/"

);

const polygon = new web3(
  "https://rpc-mainnet.maticvigil.com/"
);

module.exports = { bsc, eth, polygon };
