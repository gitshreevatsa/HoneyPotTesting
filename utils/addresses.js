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

const dexproviders = {
  1: "UniswapV2",
  56: "PancakeV2",
  137: "Quickswap",
};
// /**
//  *
//  * @param {addresses} base_address address of a respective token
//  * @param {Int} chain_id chain id of the respective network
//  * @returns {Array} returns the token holder addresses of the respective token
//  */

const addresses = async (base_address, chain_id) => {
  console.log(base_address, "base_address");
  const eoaHolders = new Array();
  const contractHolders = new Array();
  const dexArray = new Array();

  const addressHolders = await axios.get(
    ` https://api.gopluslabs.io/api/v1/token_security/${chain_id}?contract_addresses=${base_address} `
  );
  if (addressHolders["data"]["result"] === {}) {
    return false, "Not a Token";
  } else {
    const dex =
      addressHolders["data"]["result"][base_address.toLowerCase()]["dex"];
    if (dex == undefined) return false;
    console.log(dex, "dex");
    await dex.forEach((element) => {
      if (element["name"] == dexproviders[chain_id]) {
        dexArray.push(element["pair"]);
      }
    });

    const holderArray =
      addressHolders["data"]["result"][base_address.toLowerCase()]["holders"];
    const lpArray =
      addressHolders["data"]["result"][base_address.toLowerCase()][
        "lp_holders"
      ];

    console.log(holderArray, "holderArray");

    if (holderArray == undefined) {
      eoaHolders.push("0x0000000000000000000000000000000000000000");
    } else {
      await holderArray.forEach((element) => {
        if (element["is_contract"] === 0 && element["balance"] > 0) {
          eoaHolders.push(element["address"]);
        } else {
          contractHolders.push(element["address"]);
        }
      });
      if (eoaHolders.length == 0) {
        // get Lp holders and make a list of them
        await lpArray.forEach((element) => {
          if (element["is_contract"] === 0 && element["balance"] > 0) {
            eoaHolders.push(element["address"]);
          } else {
            contractHolders.push(element["address"]);
          }
        });
        console.log("To be done");
      }
    }
  }
  console.log(eoaHolders, "EOAholderArray");
  console.log(contractHolders, "ContractholderArray");
  // console.log(addressHolders['data']['result'], "addressHolders");
  if (eoaHolders.length == 0) {
    console.log("No EOA holders found");
    return false;
  } else {
    // Add the code snippet of tokenHolderChecker and send address to create a single ganacheConnection and a TokenDetails class

    return { eoaHolders, dexArray };
  }
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