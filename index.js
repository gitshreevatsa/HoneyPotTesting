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
  let isHoneyPot,
    buy_tax,
    sell_tax,
    buy_tax_error,
    sell_tax_error,
    transfer_tax_error,
    error;
  // try to get chain

  // Fetching the base and quote token holders

  const dexCollection = {
    1: "UniswapV2",
    56: "PancakeSwapV2",
    137: "QuickSwap",
  };

  const baseAddressHolders = await addresses(req.params.id, req.params.chain);
  console.log(baseAddressHolders, "baseAddressHolders");

  if (baseAddressHolders === false || baseAddressHolders.dexArray.length == 0) {
    res.json({
      error: ["No dex found"],
      isHoneyPot: 1,
      buy_tax: "",
      sell_tax: "",
      pair: "",
    });
  } else {
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
      res.json({
        error: ["No EOA holders found"],
        isHoneyPot: 1,
        buy_tax: undefined,
        sell_tax: undefined,
        pair: tokens.tokens[1],
        dex: dexCollection[req.params.chain],
      });
    } else {
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
      await funding(
        ganacheConnect.web3,
        tokenHoldersArray.quote_address_holder
      );

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
      await populateEther(
        ganacheConnect.web3,
        tokenHoldersArray.base_address_holder,
        tokenHoldersArray.quote_address_holder,
        tokens.tokens[0],
        tokens.tokens[1],
        token0,
        token1
      );

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

      console.log(taxCalc, "taxCalc");

      if (
        taxCalc.buyTaxPercentage == undefined ||
        taxCalc.sellTaxPercentage == undefined ||
        taxCalc.sellTaxPercentage > 60 ||
        taxCalc.buyTaxPercentage > 60
      ) {
        isHoneyPot = 1;
        error = 'HIGH TAX'
      } else {
        isHoneyPot = 0;
        buy_tax = taxCalc.buyTaxPercentage;
        sell_tax = taxCalc.sellTaxPercentage;
      }

      // if (
      //   taxCalc.buy_tax_error == undefined ||
      //   taxCalc.sell_tax_error == undefined
      // ) {
      //   buy_tax_error = "";
      //   sell_tax_error = "";
      //   transfer_tax_error = "";
      //   error = "";
      // }

      if (
        taxCalc.buy_tax_error !== undefined ||
        taxCalc.sell_tax_error !== undefined
      ) {
        error = "Transfer Failed";
      }

      if (taxCalc.buyTax > 60) {
        buy_tax_error = "High Buy Tax";
        error = "High Buy Tax";
      }

      if (taxCalc.sell_tax > 60) {
        sell_tax_error = "High Sell Tax";
        error = "High Sell Tax";
      }

      res.status(200).json({
        buy_tax: buy_tax | undefined,
        sell_tax: sell_tax | undefined,
        transfer_tax: ((buy_tax + sell_tax) / 2) | undefined,
        isHoneyPot: isHoneyPot,
        isHoneyPotReason: [error],
        dex: dexCollection[req.params.chain],
        pair: [token0.tokenName, token1.tokenName],
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/**
 * {
 *  buy_tax : number | undefined,
 * sell_tax : number | undefined,
 * transfer_tax: number | undefined,
 * buy_tax_error: string | '',
 * sell_tax_error: string | '',
 * transfer_tax_error: string | '',
 * isHoneypot: 1 | 0,
 * dex: string | '',
 * Pair: string | '',
 * holderCount : number,
 * gasUsed: number | undefined,
 * buy_tax_error_decoded : string | '',
 * sell_tax_error_decoded: string | '',
 * transfer_tax_error_decoded: string | '',
 * }
 */

/**
 * need to add transfer tax correctly
 *
 */
