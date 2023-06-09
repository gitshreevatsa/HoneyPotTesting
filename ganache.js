/**
 * @dev This file is used to connect to the ganache network
 */

const Web3 = require("web3");
const ganache = require("ganache");

const networkOptions = {
  56: "https://thrilling-green-dawn.bsc.discover.quiknode.pro/bfa1dcba97e594cf960398bee14d82229ccd57b9/",
  1: "https://multi-dimensional-glitter.discover.quiknode.pro/fa76eedb7480f2b9b29497d2b1c04a2414dbdd3b/",
  137: "",
};

const routerContract = {
  56: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  1: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  137: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

// /**
//  * @dev This function is used to connect to the ganache network to a specific network fork with specific accounts unlocked
//  * @param {Int} network
//  * @param {Address} buy_account
//  * @param {Address} sell_account
//  * @returns {Object} return the web3 Instance and swapRouterContract
//  */
const ganacheConnection = async (network, buy_account, sell_account) => {
  const ETHER_GOD = "0x0000000000000000000000000000000000000000";
  const dummy = '0xA93F74309D5631EbbC1E42FD411250A6b6240a69'
  console.log(buy_account, sell_account, "--------------------------------");
  // Choosing the network fork based on the network id
  let options = {};
  if (sell_account !== undefined) {
    options = {
      fork: networkOptions[network],
      wallet: { unlockedAccounts: [buy_account, sell_account, ETHER_GOD, dummy] },
    };
  } else {
    options = {
      fork: networkOptions[network],
      wallet: { unlockedAccounts: [buy_account, ETHER_GOD, dummy] },
    };
  }
  // Constructing the provider and web3 instance
  let ganacheProvider;
  let web3;
  let swapRouterContract;
  try {
    ganacheProvider = ganache.provider(options);
    web3 = new Web3(ganacheProvider);

    swapRouterContract = new web3.eth.Contract(
      require("./abi/uniswap.json").abi,
      routerContract[network]
    );

  } catch (e) {
    console.log(e);
    console.log("Error in connecting to ganache network");
    console.log(buy_account, sell_account, "--------------------------------");
  }

  return { web3, swapRouterContract };
};
//Connect the routers to providers based on network taken from GoPlus

module.exports = { ganacheConnection };
