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
  "https://rpc.ankr.com/polygon/7906078e674202ad67a7d9560d1ee305a91251a9e95a6046dbaeb7e64d2023bd"
);

module.exports = { bsc, eth, polygon };
