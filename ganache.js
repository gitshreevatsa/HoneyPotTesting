const Web3 = require("web3");
const ganache = require("ganache");

// Exported to use as ganache instance
// to export the routers contracts

// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const networkOptions = {
  56: "https://thrilling-green-dawn.bsc.discover.quiknode.pro/bfa1dcba97e594cf960398bee14d82229ccd57b9/",
  1: "https://multi-dimensional-glitter.discover.quiknode.pro/fa76eedb7480f2b9b29497d2b1c04a2414dbdd3b/",
  137: "",
};

const routerContract = {
  56: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  1: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};
const ganacheConnection = async(network, buy_account, sell_account) => {
  const USER_ADDRESS = buy_account;
  const RECIVER_ADDRESS = sell_account;
  const ETHER_GOD = "0x0000000000000000000000000000000000000000";
    console.log(buy_account, sell_account, "+++++++++++++++++");
  const options = {
    fork: networkOptions[network],
    wallet: { unlockedAccounts: [USER_ADDRESS, RECIVER_ADDRESS, ETHER_GOD] },
  };

  const ganacheProvider = ganache.provider(options);

  const web3 = new Web3(ganacheProvider);

  const uniswapRouterEth = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const pancakeRouterBsc = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

  const swapRouterContract = new web3.eth.Contract(
    require("./abi/uniswap.json").abi,
    routerContract[network]
  );

  // const pancakeRouterContract = new web3.eth.Contract(
  //     require("./abi/pancake.json").abi,
  //     routerContract[network]
  // );

  return { web3, swapRouterContract };
};
//Connect the routers to providers based on network taken from GoPlus

module.exports = { ganacheConnection };
