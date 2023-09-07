/**
 * @dev This file is used to connect to the ganache network
 */

const Web3 = require("web3");
const ganache = require("ganache");

const networkOptions = {
  56: "https://thrilling-green-dawn.bsc.discover.quiknode.pro/bfa1dcba97e594cf960398bee14d82229ccd57b9/",
  1: "https://eth-mainnet.g.alchemy.com/v2/P8Pv2-iOZ3VJu0eoBV9lQX7yJ4HLnJbd",
  137: "https://solemn-palpable-arrow.matic.discover.quiknode.pro/534b0e6432ecb15aa2a951f048855fdcd58d6358/",
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
  // let web3Provider = new Web3(networkOptions[network]);
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
      // blockNumber : await web3Provider.eth.getBlockNumber()
    };
  }
  // Constructing the provider and web3 instance
  let ganacheProvider;
  let web3;
  let swapRouterContract;
  try {
    console.log(networkOptions[network]);
    ganacheProvider = ganache.provider(options);
    web3 = new Web3(ganacheProvider);
    console.log("Connected to ganache network");
    swapRouterContract = new web3.eth.Contract(
      require("./abi/uniswap.json").abi,
      routerContract[network]
    );
    console.log("Connected to swap router contract");
  } catch (e) {
    console.log(e);
    console.log("Error in connecting to ganache network");
    console.log(buy_account, sell_account, "--------------------------------");
  }
  console.log(web3);
  return { web3, swapRouterContract };
};
//Connect the routers to providers based on network taken from GoPlus

module.exports = { ganacheConnection };


// 0xf977814e90da44bfa03b6295a0616a897441acec
// 0x8eb8a3b98659cce290402893d0123abb75e3ab28