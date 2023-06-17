const express = require("express");
const NodeCache = require("node-cache");
const app = express();
const port = 3000;
const cache = new NodeCache();

const { ganacheConnection } = require("./ganache");
const { fetchTokenDetails, TokenDetails } = require("./utils/fetchErcDetails");
const { tokenTax } = require("./controllers/swapTest");
const { geckoApi } = require("./utils/gecko");
const { populateEther } = require("./utils/balancePopulator");
const { addresses } = require("./utils/addresses");
const { tokenHolders } = require("./utils/tokenHolderChecker");
const { getRouter } = require("./utils/uniswapV2");
const { funding } = require("./utils/sendEther");
const { reChecker } = require("./utils/balanceRechecker");

const dexCollection = {
  1: "UniswapV2",
  56: "PancakeSwapV2",
  137: "QuickSwap",
};

const stableCoins = [
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
];

const supportedChains = ["1", "56", "137"];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/:id/:chain", async (req, res) => {
  if (!supportedChains.includes(req.params.chain)) {
    res.status(400).json({
      error: ["Unsupported Chain ID"],
    });
  } else {
    let isHoneyPot,
      buy_tax = 0.00,
      sell_tax = 0.00,
      error,
      stableToken;
    // try to get chain

    // Fetching the base and quote token holders
    // if (stableCoins.includes(req.params.id.toLocaleLowerCase())) {
    //   stableToken = cache.get("cachedData");
    //   if ((stableToken["chainId"] = req.params.chain)) {
    //     stableToken = stableToken["address"];
    //   }
    //   console.log(
    //     stableToken,
    //     "*********************************************************************************"
    //   );
    // }

    const baseAddressHolders = await addresses(
      req.params.id,
      req.params.chain,
      undefined
    );
    console.log(baseAddressHolders, "baseAddressHolders");

    if (
      baseAddressHolders === false ||
      baseAddressHolders.dexArray.length == 0
    ) {
      res.json({
        error: ["No dex found"],
        isHoneyPot: 1,
        buy_tax: "",
        sell_tax: "",
        pair: "",
      });
    } else {
      console.log(baseAddressHolders.dexArray[0], "PAIR CONTRACT");
      const tokens = await getRouter(
        baseAddressHolders.dexArray[0],
        req.params.chain
      );

      // Uniswap V2 Pair caller function , then proceed with quoteTokenHolders addresses

      // let quoteAddressHolders;

      const quoteAddressHolders = await addresses(
        tokens.tokens[1],
        req.params.chain,
        baseAddressHolders.eoaHolders
      );

      // console.log(baseAddressHolders, quoteAddressHolders);
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
          await tokens.tokens[0],
          tokens.tokens[1],
          "###################################################"
        );

        const reCheckase = await reChecker(
          baseAddressHolders.eoaHolders,
          req.params.chain,
          tokens.tokens[0]
        );
        const reCheckQuote = await reChecker(
          quoteAddressHolders.eoaHolders,
          req.params.chain,
          tokens.tokens[1]
        );
        console.log(reCheckase, reCheckQuote, "reChecker");
        if (
          reCheckase == false ||
          reCheckQuote == false ||
          reCheckase.length == 0 ||
          reCheckQuote.length == 0
        ) {
          res.json({
            error: ["No EOA holders found"],
            isHoneyPot: 1,
            buy_tax: undefined,
            sell_tax: undefined,
            pair: tokens.tokens[1],
            dex: dexCollection[req.params.chain],
          });
        } else {
          baseAddressHolders.eoaHolders = reCheckase;
          quoteAddressHolders.eoaHolders = reCheckQuote;
          const tokenHoldersArray = await tokenHolders(
            baseAddressHolders.eoaHolders,
            quoteAddressHolders.eoaHolders
          );

          console.log(
            tokenHoldersArray,
            "tokenHoldersArray ++++++++++++++++++++++++++++++++++++++++++++++++++++++"
          );

          const ganacheConnect = await ganacheConnection(
            req.params.chain,
            tokenHoldersArray.base_address_holder,
            tokenHoldersArray.quote_address_holder
          );
          console.log(
            "ganache connection ready ///////////////////////////////////////////////////",
            await ganacheConnect.web3.eth.getBlockNumber()
          );
          console.time("timer_start");
          await funding(
            ganacheConnect.web3,
            tokenHoldersArray.base_address_holder
          );
          await funding(
            ganacheConnect.web3,
            tokenHoldersArray.quote_address_holder
          );

          console.timeEnd("timer_start");

          console.time("Token details");
          const token0 = await fetchTokenDetails(
            ganacheConnect.web3,
            tokens.tokens[0]
          );

          const token1 = await fetchTokenDetails(
            ganacheConnect.web3,
            tokens.tokens[1]
          );
          console.timeEnd("Token details");
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

          console.time("POPULATING ETHER");
          // // add error handling if else statement
          const sendEther = await populateEther(
            ganacheConnect.web3,
            tokenHoldersArray.base_address_holder,
            tokenHoldersArray.quote_address_holder,
            tokens.tokens[0],
            tokens.tokens[1],
            token0,
            token1
          );
          console.timeEnd("POPULATING ETHER");
          if (
            sendEther.base_token_transfer_error != undefined ||
            sendEther.quote_token_transfer_error != undefined
          ) {
            res.json({
              buy_tax: undefined,
              sell_tax: undefined,
              transfer_tax: undefined,
              isHoneyPot: 1,
              isHoneyPotReason: [
                sendEther.base_token_transfer_error |
                  sendEther.quote_token_transfer_error,
              ],
              dex: dexCollection[req.params.chain],
              pair: [req.params.id, token1.tokenName],
            });
          } else {
            console.time(
              "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UNISWAP INTERACTION : "
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
            console.timeEnd(
              "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UNISWAP INTERACTION : "
            );

            console.log(taxCalc, "taxCalc");

            if (
              taxCalc.buyTaxPercentage == undefined ||
              taxCalc.sellTaxPercentage == undefined ||
              // taxCalc.approve_error == undefined ||
              taxCalc.sellTaxPercentage > 60 ||
              taxCalc.buyTaxPercentage > 60
            ) {
              isHoneyPot = 1;
              error = "HIGH TAX";
            } else {
              isHoneyPot = 0;
            }

            if (taxCalc.approve_error != undefined) {
              isHoneyPot = 1;
              error = "APPROVE FAILED";
            }

            if (
              taxCalc.buy_tax_error !== undefined ||
              taxCalc.sell_tax_error !== undefined ||
              taxCalc.approve_error !== undefined
            ) {
              error = "Transfer Failed";
              isHoneyPot = 1;
              buy_tax = taxCalc.buyTaxPercentage;
              sell_tax = taxCalc.sellTaxPercentage;
            }

            if (taxCalc.buyTax > 60) {
              isHoneyPot = 1;
              buy_tax_error = "High Buy Tax";
              error = "High Buy Tax";
              buy_tax = taxCalc.buyTaxPercentage;
              sell_tax = taxCalc.sellTaxPercentage;
            }

            if (taxCalc.sell_tax > 60) {
              isHoneyPot = 1;
              sell_tax_error = "High Sell Tax";
              error = "High Sell Tax";
            }

            if(taxCalc.buyTaxPercentage != undefined && taxCalc.sellTaxPercentage != undefined){
              buy_tax = Math.round(taxCalc.buyTaxPercentage);
              sell_tax = Math.round(taxCalc.sellTaxPercentage);
            }

            res.status(200).json({
              buy_tax: sell_tax | undefined,
              sell_tax: buy_tax | undefined,
              transfer_tax: ((buy_tax + sell_tax) / 2) | undefined,
              isHoneyPot: isHoneyPot,
              isHoneyPotReason: [error],
              dex: dexCollection[req.params.chain],
              pair: [token0.tokenName, token1.tokenName],
            });
          }
        }
      }
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
