const axios = require("axios");
require("dotenv").config();
const web3 = require("web3");
const { bsc, eth, polygon } = require("./providers");

const providers = {
  1: eth,
  56: bsc,
  137: polygon,
};

// /**
//  *
//  * @param {addresses} base_address address of a respective token
//  * @param {Int} chain_id chain id of the respective network
//  * @returns {Array} returns the token holder addresses of the respective token
//  */

const addresses = async (base_address, chain_id) => {
  //  Block explorer api's for respective networks
  const baseTokenscans = {
    1: `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.etherscan}`,
    56: `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.bscscan}`,
    137: `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.polygonscan}`,
  };
  // Indexing based on chain id
  const scanUrl = baseTokenscans[chain_id];
  console.log(
    scanUrl,
    "******************************************************"
  );
  // Fetching the data from the respective block explorer api
  const response = await axios.get(scanUrl);
  const jsonData = response.data || {};
  let list = jsonData["result"];
  let to = new Set();
  // Iterating through the list of transactions and adding the token holder addresses to a set
  list.forEach((element) => {
    const web3 = providers[chain_id];
    let a = web3.utils.toChecksumAddress(element["topics"][2].substr(26));
    to.add(a);
  });
  console.log(to);

  to = Array.from(to);
  return to;
};

module.exports = { addresses };
