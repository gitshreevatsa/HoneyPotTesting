const web3 = require("web3");
// /**
//  *
//  * @param {Address} token_address Address of the token to find its quote token
//  * @param {Int} chain Chain id of the token
//  * @returns {Array} return the array of base token and quote token
//  */

const geckoApi = async (token_address, chain) => {
  const chain_id = {
    1: "eth",
    56: "bsc",
    137: "polygon-pos",
  };

  // const dex = {
  //   1: "uniswap-v2",
  //   56: "pancakeswap-v2",
  //   137: "quickswap",
  // };

  // Constructing the coin gecko api url and calling it
  const url = `https://api.geckoterminal.com/api/v2/networks/${chain_id[chain]}/tokens/${token_address}/pools`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.data[0].relationships, "*********************************");

  const pairdata = data.data[0];
  const base_token = pairdata.relationships.base_token.data.id.substr(
    chain_id[chain].length + 1
  );
  const quote_token = pairdata.relationships.quote_token.data.id.substr(
    chain_id[chain].length + 1
  );

  // constructing an array of base token and quote token
  path = [
    web3.utils.toChecksumAddress(base_token),
    web3.utils.toChecksumAddress(quote_token),
  ];

  return { path };
};

module.exports = { geckoApi };
