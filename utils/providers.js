const web3 = require("web3");

const bsc = new web3(
  "https://bsc-dataseed.binance.org/"
);

const eth = new web3(

    "https://mainnet.infura.io/v3/8c5b2d0b0a9e4b6e8b0b3b2b0f2b3b2b"

);

const polygon = new web3(
  "https://rpc-mainnet.maticvigil.com/"
);

module.exports = { bsc, eth, polygon };
