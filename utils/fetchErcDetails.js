const web3 = require("web3");

class TokenDetails {
  contract;
  tokenName;
  symbol;
  total_supply;
  decimals;

  constructor(contract, tokenName, symbol, total_supply, decimals) {
    this.contract = contract;
    this.tokenName = tokenName;
    this.symbol = symbol;
    this.total_supply = total_supply;
    this.decimals = decimals;
  }

  getAddress = () => {
    return this.contract.address;
  };

  convertToDecimals = (amount) => {
    return amount / 10 ** this.decimals;
  };

  convertToRaw = (amount) => {
    return amount * 10 ** this.decimals;
  };

  fetchBalanceOf = async (address) => {
    var raw_amount = await this.contract.methods.balanceOf(address).call();
    return this.convertToDecimals(raw_amount);
  };
}

// /**
//  *
//  * @param {WEB3} web3 web3 instance
//  * @param {Address} address token address
//  * @returns {TokenDetails} token details
//  */

const fetchTokenDetails = async (web3, address) => {
  const token_address = web3.utils.toChecksumAddress(address);
  // Constructing the ERC contract of a token
  const erc20 = new web3.eth.Contract(
    require("../abi/erc20.json"),
    token_address
  );

  const tokenName = await erc20.methods.name().call();

  const symbol = await erc20.methods.symbol().call();

  const decimals = await erc20.methods.decimals().call();

  const supply = await erc20.methods.totalSupply().call();

  console.log(tokenName, symbol, decimals, supply, "--------------------------------");

  return new TokenDetails(erc20, tokenName, symbol, supply, decimals);
};

module.exports = { fetchTokenDetails, TokenDetails };
