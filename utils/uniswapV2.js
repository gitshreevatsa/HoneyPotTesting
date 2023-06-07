const abi = require("../abi/uniswapV2.json").abi;
const web3 = require("web3");

const { bsc, eth, polygon } = require("./providers");

const networkOptions = {
  56: bsc,
  1: eth,
  137: polygon,
};

const networkTokens = {
  56: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  137: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
};

const getRouter = async (base_address, network) => {
  const router = new networkOptions[network].eth.Contract(abi, base_address);

  const token0cast = await router.methods.token0().call();
  const token1cast = await router.methods.token1().call();

  const token0 = token0cast.toLowerCase();
  const token1 = token1cast.toLowerCase();
  let tokens = [token0, token1];
  if (tokens[0] == networkTokens[network]) {
    tokens = [token1, token0];
  }

  return { tokens };
};

module.exports = { getRouter };
