const axios = require("axios");
require("dotenv").config();
const web3 = require("web3");
const { bsc, eth, polygon } = require("./providers");
const { fetchTokenDetails } = require("./fetchErcDetails");
const sdk = require("api")("@chainbase/v1.0#es1jjlg6g4o2b");

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
  // const baseTokenscans = {
  //   1: `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.etherscan}`,
  //   56: `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.bscscan}`,
  //   137: `https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=1&toBlock=999999999999999&address=${base_address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&page=1&offset=100&apikey=${process.env.polygonscan}`,
  // };

  // // Indexing based on chain id
  // const scanUrl = baseTokenscans[chain_id];
  // console.log(
  //   scanUrl,
  //   "******************************************************"
  // );
  // // Fetching the data from the respective block explorer api
  // const response = await axios.get(scanUrl);
  // const jsonData = response.data || {};
  // let list = jsonData["result"];
  // const to = new Array()
  // // Iterating through the list of transactions and adding the token holder addresses to a set
  // list.forEach(async (element) => {
  //   const web3 = providers[chain_id];
  //   let a = web3.utils.toChecksumAddress(element["topics"][2].substr(26));
  //   to.push(a);
  // });
  // console.log(
  //   to,
  //   "..................................................."
  // );

  // // to =  Array.from(to);
  // return to;
  console.log(base_address, "base_address");
  // let addressHolders = new Array();
  // sdk.getTopTokenHolders({
  //   chain_id: '1',
  //   contract_address: base_address,
  //   page: '1',
  //   limit: '20',
  //   'x-api-key': '2PeBNLXgOFQI2K5cjs8SyA4LtCI'
  // })
  //   .then(({ data }) => console.log(data.data.holders[0].wallet_address))
  //   .catch(err => console.error(err));

  const addressHolders = await axios.get(
    ` https://api.gopluslabs.io/api/v1/token_security/${chain_id}?contract_addresses=${base_address} `
  );
  const holderArray =
    addressHolders["data"]["result"][base_address.toLowerCase()]["holders"];
  const lpArray =
    addressHolders["data"]["result"][base_address.toLowerCase()]["lp_holders"];
  console.log(holderArray, "holderArray");
  const eoaHolders = new Array();
  const contractHolders = new Array();
  if (holderArray == undefined) {
    eoaHolders.push("0x0000000000000000000000000000000000000000");
  } else {
    await holderArray.forEach((element) => {
      if (element["is_contract"] === 0 && element["balance"] > "0") {
        eoaHolders.push(element["address"]);
      } else {
        contractHolders.push(element["address"]);
      }
    });
    if (eoaHolders.length == 0) {
      // get Lp holders and make a list of them
      await lpArray.forEach((element) => {
        if (element["is_contract"] === 0 && element["balance"] > "0") {
          eoaHolders.push(element["address"]);
        }else{
          contractHolders.push(element["address"]);
        }
      });
      console.log("To be done");
    }
  }
  console.log(eoaHolders, "EOAholderArray");
  console.log(contractHolders, "ContractholderArray");
  // console.log(addressHolders['data']['result'], "addressHolders");
  if (eoaHolders.length == 0) {
    console.log("No EOA holders found");
    return false;
  } else {
    return eoaHolders;
  }
};

module.exports = { addresses };

// " https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=0x4fa38c2927d0155402cA22D993117e29065CE8eb"

// https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c