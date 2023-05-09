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
  const tokens = await geckoApi(req.params.id, req.params.chain);

  const addressHolders = await addresses(req.params.id, req.params.chain);
  const ganacheConnect = await ganacheConnection(req.params.chain, addressHolders[0], addressHolders[1]);
  const web3 = ganacheConnect.web3;
  const swapRouterContract = ganacheConnect.swapRouterContract;
  await populateEther(
    web3,
    addressHolders[0],
    addressHolders[1],
    tokens.path[0],
    tokens.path[1]
  );
  // tokenTax(web3, swapRouterContract, req.params.id, tokens.path[1], addressHolders[0], addressHolders[1], 1000000000000000000, true, 1000000, 1000000000);
  res.send("Working");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
