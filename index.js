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
const { getRouter } = require("./utils/uniswapV2");
const { funding } = require("./utils/sendEther");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/:id/:chain", async (req, res) => {
  // try to get chain

  // Fetching the base and quote token holders
  const baseAddressHolders = await addresses(req.params.id, req.params.chain);
  console.log(baseAddressHolders, "baseAddressHolders");

  const tokens = await getRouter(
    baseAddressHolders.dexArray[0],
    req.params.chain
  );

  // Uniswap V2 Pair caller function , then proceed with quoteTokenHolders addresses

  const quoteAddressHolders = await addresses(
    tokens.tokens[1],
    req.params.chain
  );

  console.log(baseAddressHolders, quoteAddressHolders);
  if (baseAddressHolders == false || quoteAddressHolders == false) {
    res.send("No holders found");
  } else {
    // console.log(
    //   baseAddressHolders.eoaHolders[0],
    //   quoteAddressHolders.eoaHolders[0],
    //   "###################################################"
    // );
    console.log(
      tokens.tokens[0],
      tokens.tokens[1],
      "###################################################"
    );

    const tokenHoldersArray = await tokenHolders(
      baseAddressHolders.eoaHolders,
      quoteAddressHolders.eoaHolders
    );

    console.log(
      tokenHoldersArray,
      "tokenHoldersArray ++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );
    // single ganache collection

    const ganacheConnect = await ganacheConnection(
      req.params.chain,
      tokenHoldersArray.base_address_holder,
      tokenHoldersArray.quote_address_holder
    );
    console.log(
      "ganache connection ready ///////////////////////////////////////////////////"
    );
    await funding(ganacheConnect.web3, tokenHoldersArray.base_address_holder);
    await funding(ganacheConnect.web3, tokenHoldersArray.quote_address_holder);

    const token0 = await fetchTokenDetails(
      ganacheConnect.web3,
      tokens.tokens[0]
    );

    const token1 = await fetchTokenDetails(
      ganacheConnect.web3,
      tokens.tokens[1]
    );

    // // rechecking the holders

    console.log(
      tokenHoldersArray.base_address_holder,
      tokens.tokens[0],
      "###################################################"
    );

    console.log(
      tokenHoldersArray.quote_address_holder,
      tokens.tokens[1],
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
    );

    // // add error handling if else statement
    const populator = await populateEther(
      ganacheConnect.web3,
      tokenHoldersArray.base_address_holder,
      tokenHoldersArray.quote_address_holder,
      tokens.tokens[0],
      tokens.tokens[1],
      token0,
      token1
    );

    // //   // console.log(populator.baseTokenReciept, populator.quoteTokenReciept, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    // // Need to test swap : Swaps with router contract functions
    // // add error handling if else statement

    const taxCalc = await tokenTax(
      ganacheConnect.web3,
      ganacheConnect.swapRouterContract,
      tokens.tokens[0],
      tokens.tokens[1],
      tokenHoldersArray.base_address_holder,
      tokenHoldersArray.quote_address_holder,
      1,
      true,
      300000,
      1000000000,
      tokenHoldersArray,
      token0,
      token1
    );

    let error;
    if (taxCalc.buyTax == undefined || taxCalc.sell_tax == undefined) {
      error = "HoneyPot Alert";
    } else {
      error = "Not a HoneyPot ";
    }
    res.status(200).json({
      buy_tax: taxCalc.buyTax,
      sell_tax: taxCalc.sell_tax,
      error,
    });
    // if (
    //   taxCalc.buy_tax_error != undefined ||
    //   taxCalc.sell_tax_error != undefined
    // ) {
    //   if (
    //     populator.base_token_transfer_error != undefined ||
    //     populator.quote_token_transfer_error != undefined
    //   ) {
    //     res.json({
    //       buy_tax: taxCalc.buyTax,
    //       sell_tax: taxCalc.sell_tax,
    //       transfer_tax: populator.base_token_transfer,
    //     });
    //   }
    // } else {
    //   res.json({
    //     buy_tax_error: taxCalc.buy_tax_error,
    //     sell_tax_error: taxCalc.sell_tax_error,
    //   });
    // }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
