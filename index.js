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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/:id/:chain", async (req, res) => {
  // Calling gecko terminal to fetch respective quote token details
  const tokens = await geckoApi(req.params.id, req.params.chain);

  // Fetching the base and quote token holders
  const baseAddressHolders = await addresses(tokens.path[0], req.params.chain);
  const quoteAddressHolders = await addresses(tokens.path[1], req.params.chain);

  // rechecking the holders
  console.log(baseAddressHolders, tokens.path[0], "###################################################");
  console.log(quoteAddressHolders, tokens.path[1], "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

  // Connecting to ganache hard fork and unlocking the accounts
  const ganacheConnect = await ganacheConnection(req.params.chain, baseAddressHolders[2], quoteAddressHolders[2]);

  const web3Instance = ganacheConnect.web3;
  const swapRouterContract = ganacheConnect.swapRouterContract;

  // Populating the accounts with ether and tokens
  await populateEther(
    web3Instance,
    baseAddressHolders[2],
    quoteAddressHolders[2],
    tokens.path[0],
    tokens.path[1]
  );

  // Need to test swap : Swaps with router contract functions
  // await tokenTax(web3, swapRouterContract, tokens.path[0], tokens.path[1], baseAddressHolders[2], quoteAddressHolders[2], 1, true, 1000000, 1000000000);
  res.send("Working");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
