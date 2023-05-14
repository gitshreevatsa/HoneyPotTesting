/**
 *  Create a ganache simulator
 *  Create a endpoint to take in token address and chain
 *  Connect to Database
 */

/**
 * Contains mainly pancake and uniswap simulations
 * Return the execution result
 */

/**
 * File Structure:
 * - index.js
 * - GoPlus.js
 * - Ganache.js
 * - swapTest.js : Simulates the transactions based on the AMM it exists on given by GoPlus.js
 * - databaseModel.js
 * - config.js
 * - abi - folder -- pancake.js -- uniswap.js -- erc20.js
 */

// call gecko terminal for quote token
// call goplus for pool address

// design how to call for ganache hard fork based on chain id
// based on hard fork, connect the right router contract
// pass above 2 to simulator

const express = require("express");
const app = express();
const port = 3000;

const { ganacheConnection } = require("./ganache");
const { fetchTokenDetails, TokenDetails } = require("./utils/fetchErcDetails");
const { tokenTax } = require("./controllers/swapTest");
const { geckoApi } = require("./utils/gecko");
const { populateEther } = require("./utils/balancePopulator");
const { addresses } = require("./utils/addresses");
const { tokenHolders } = require("./utils/tokenHolderChecker");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/:id/:chain", async (req, res) => {
  // Calling gecko terminal to fetch respective quote token details
  const tokens = await geckoApi(req.params.id, req.params.chain);

  // Fetching the base and quote token holders
  const baseAddressHolders = await addresses(tokens.path[0], req.params.chain);
  const quoteAddressHolders = await addresses(tokens.path[1], req.params.chain);
  console.log(
    baseAddressHolders[0],
    quoteAddressHolders[0],
    "###################################################"
  );
  console.log(
    tokens.path[0],
    tokens.path[1],
    "###################################################"
  );

  const ganacheConnect = await ganacheConnection(
    req.params.chain,
    baseAddressHolders[0],
    quoteAddressHolders[0]
  );

  const tokenHoldersArray = await tokenHolders(
    ganacheConnect.web3,
    tokens.path,
    baseAddressHolders,
    quoteAddressHolders,
    req.params.chain
  );
  // console.log(tokenHoldersArray.base_address_holder, tokenHoldersArray.quote_address_holder, "###################################################");

  // // rechecking the holders
  console.log(
    tokenHoldersArray.base_address_holder,
    tokens.path[0],
    "###################################################"
  );
  console.log(
    tokenHoldersArray.quote_address_holder,
    tokens.path[1],
    "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
  );

  // // Connecting to ganache hard fork and unlocking the accounts
  // const newConnection = await ganacheConnection(req.params.chain, tokenHoldersArray.base_address_holder, tokenHoldersArray.quote_address_holder);
  // const web3Instance = newConnection.web3;
  // const swapRouterContract = newConnection.swapRouterContract;

  // // Populating the accounts with ether and tokens
  // const populator =
  console.log(tokenHoldersArray.ganacheConnect.web3);

  await populateEther(
    tokenHoldersArray.ganacheConnect.web3,
    tokenHoldersArray.base_address_holder,
    tokenHoldersArray.quote_address_holder,
    tokens.path[0],
    tokens.path[1]
  );
  //   // console.log(populator.baseTokenReciept, populator.quoteTokenReciept, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
  // Need to test swap : Swaps with router contract functions
  await tokenTax(
    tokenHoldersArray.ganacheConnect.web3,
    tokenHoldersArray.ganacheConnect.swapRouterContract,
    tokens.path[0],
    tokens.path[1],
    tokenHoldersArray.base_address_holder,
    tokenHoldersArray.quote_address_holder,
    1,
    true,
    1000000,
    1000000000,
    tokenHoldersArray.balances
  );
  res.send("Working");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
