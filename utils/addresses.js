const axios = require("axios");
require("dotenv").config();
const web3 = require("web3");
const { bsc, eth, polygon } = require("./providers");
const { fetchTokenDetails } = require("./fetchErcDetails");
const { arrayChecker } = require("./arrayChecker");
const { apiCall } = require("./apiCall");

const providers = {
  1: eth,
  56: bsc,
  137: polygon,
};

const dexproviders = {
  1: "UniswapV2",
  56: "PancakeV2",
  137: "QuickSwap",
};

const Ankr_Chain_Mapping = {
  1: "eth",
  56: "bsc",
  137: "polygon",
};
// /**
//  *
//  * @param {addresses} base_address address of a respective token
//  * @param {Int} chain_id chain id of the respective network
//  * @returns {Array} returns the token holder addresses of the respective token
//  */

const addresses = async (base_address, chain_id, copyAddress) => {
  console.log(base_address, "base_address");
  console.log(copyAddress);

  let eoaHolders = new Array();
  const contractHolders = new Array();
  const dexArray = new Array();
  let dex;

  const url = `https://rpc.ankr.com/multichain/79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01/?ankr_getTokenHolders=`;

  const body = {
    jsonrpc: "2.0",
    method: "ankr_getTokenHolders",
    params: {
      blockchain: Ankr_Chain_Mapping[chain_id],
      contractAddress: base_address,
    },
    id: 1,
  };

  let tokenHolderInformation = await apiCall(url, "POST", body);

  console.log(tokenHolderInformation, "tokenHolderInformation");

  let addressHolders = tokenHolderInformation.result.holders;

  const getDex = await axios.get(
    ` https://api.gopluslabs.io/api/v1/token_security/${chain_id}?contract_addresses=${base_address} `
  );
  // console.log(addressHolders["data"]["result"], "addressHolders");
  // first taking the dex
  if (false) {
    console.log("No data found");
    return false;
  } else {
    // console.log(addressHolders["data"]["result"][base_address.toLowerCase()]);
    if (
      getDex["data"]["result"][base_address.toLowerCase()]["is_in_dex"] === "1"
    )
      console.log("Entered here");
    dex = getDex["data"]["result"][base_address.toLowerCase()]["dex"];
    console.log(dex, "dex");
    if (dex === undefined) return false;
    // console.log(dex, "dex");
    console.log(dexproviders[chain_id], "dexproviders");
    await dex.forEach((element) => {
      if (element["name"] === dexproviders[chain_id]) {
        console.log(element["name"], "DEX IT IS IN");
        dexArray.push(element["pair"]);
      }
    });
    console.log(dexArray, "dexArray");
    // change
    // console.log(dexArray);

    // second :  taking the holder array and lp array
    const holderArray = addressHolders;
    // const lpArray =
    //   addressHolders["data"]["result"][base_address.toLowerCase()][
    //     "lp_holders"
    //   ];
    // const ownerHolder =
    //   addressHolders["data"]["result"][base_address.toLowerCase()][
    //     "creator_address"
    //   ];
    // const ownerBalane =
    //   addressHolders["data"]["result"][base_address.toLowerCase()][
    //     "creator_balance"
    //   ];
    // console.log(lpArray, "lparray");
    // console.log(ownerBalane, "OWNER BALANCE");
    // console.log(ownerHolder, "OWNER");
    // // console.log(holderArray, "holderArray");

    if (holderArray === undefined && ownerBalane === "0") {
      eoaHolders.push("0x0000000000000000000000000000000000000000");
      console.log("holders are pushed here");
    } else if (holderArray) {
      console.log("ADDRESSES HOLDING");
      await holderArray.forEach((element) => {
        if (element["balance"] > "0.001" && eoaHolders.length < 20) {
          eoaHolders.push(element["holderAddress"]);
        } else {
          contractHolders.push(element["holderAddress"]);
        }
      });

      if (copyAddress === undefined) {
        copyAddress = [];
      }

      // if (lpArray) {
      //   if (eoaHolders.length === 0) {
      //     // get Lp holders and make a list of them
      //     console.log(
      //       "CONTROL TRANSFERRED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      //     );
      //     eoaHolders = [];

      //     await lpArray.forEach((element) => {
      //       if (element["is_contract"] == 0) {
      //         eoaHolders.push(element["address"]);
      //       } else {
      //         contractHolders.push(element["address"]);
      //       }
      //     });
      //     console.log("LP HOLDER PUSHED");
      //     console.log(eoaHolders[2], "EOA HOLDER", base_address);
      //   }
      // }
      // else if (eoaHolders.length === 0 && ownerBalane !== "0") {
      //   eoaHolders.push(ownerHolder);
    }
  }

  // To Do: Write a function for => Give 2 arrays and get the unlike elements as a result

  if (copyAddress !== undefined) {
    console.log("COPY ADDRESS IS NOT UNDEFINED");
    console.log(copyAddress);
    console.log(eoaHolders);
    eoaHolders = eoaHolders.filter((item) => !copyAddress.includes(item));
    console.log(eoaHolders);
  }

  // console.log(eoaHolders, "EOAholderArray");
  // console.log(contractHolders, "ContractholderArray");
  // console.log(addressHolders['data']['result'], "addressHolders");
  // if (eoaHolders.length === 0) {
  //   console.log("No EOA holders found");
  //   return false;
  // } else {
  // Add the code snippet of tokenHolderChecker and send address to create a single ganacheConnection and a TokenDetails class
  console.log(dexArray, "dexArray");
  return { eoaHolders, dexArray };
};

module.exports = { addresses };

// " https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=0x4fa38c2927d0155402cA22D993117e29065CE8eb"

// https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c

/**
 * {
 *  buy_tax,
 * sell_tax,
 * transfer_tax,
 * buy_tax_error,
 * sell_tax_error,
 * transfer_tax_error,
 * isHoneypot,
 * dex,
 * Pair,
 * holderCount,
 * gasUsed,
 * buy_tax_error_decoded,
 * sell_tax_error_decoded,
 * transfer_tax_error_decoded,
 * }
 */
