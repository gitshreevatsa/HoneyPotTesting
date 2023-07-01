const web3 = require("web3");

const { bsc, eth, polygon } = require("./providers");
const { Log } = require("ethers");

const networkOptions = {
  56: bsc,
  1: eth,
  137: polygon,
};

const reChecker = async (addressArray, network, tokenAddress) => {
  let provider = networkOptions[network];
  let balanceArray = [];
  console.log(addressArray, "addressArray");
  const web3Provider = new web3(provider);
  const token = new web3Provider.eth.Contract(
    require("../abi/erc20.json"),
    tokenAddress
  );
  // console.log("DEBUG:::::::::::::::::::::::::::", await token.methods.balanceOf('0x57cae9728d37ede7971daed411bc46abf36cf6e4').call());
  for (let i = 0; i < addressArray.length; i++) {
    let balance = await token.methods.balanceOf(addressArray[i]).call();
    if (balance > 0) balanceArray.push(addressArray[i]);
  }
  if (balanceArray.length > 0) return balanceArray;
  else return false;
};

module.exports = { reChecker };
