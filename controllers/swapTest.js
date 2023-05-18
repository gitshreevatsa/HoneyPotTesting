const { fetchTokenDetails, TokenDetails } = require("../utils/fetchErcDetails");
const BN = require("bn.js");
// YET TO WORK ON THIS
// Test
// Add error classes
// figure return types
// add liquidity to buy and sell accounts
const tokenTax = async (
  web3, // web3 instance: ganache hard fork
  router, // router contract
  base_token_address, // base token address
  quote_token_address, // quote token address
  buy_account, // ganache account
  sell_account, // ganache account
  buy_amount,
  approve,
  gas_limit,
  gas_price,
  balances
) => {
  approve = true;
  const Web3 = web3;
  const routerContract = router;

  console.log(
    quote_token_address,
    base_token_address,
    buy_account,
    sell_account,
    buy_amount,
    "======================================================================"
  );

  const quote_token_details = await fetchTokenDetails(
    Web3,
    quote_token_address
  );
  const quote_token = quote_token_details.contract;

  const base_token_details = await fetchTokenDetails(Web3, base_token_address);
  const base_token = base_token_details.contract;
  let tx_params;
  if (gas_limit) {
    tx_params = {
      gas: gas_limit,
      gasPrice: gas_price,
    };
  } else {
    tx_params = {};
  }
  console.log(
    await quote_token.methods.balanceOf(routerContract._address).call(),
    "router balance of ",
    quote_token_details.tokenName,

    "======================================================================",

    await base_token.methods.balanceOf(routerContract._address).call(),
    "router balance of ",
    base_token_details.tokenName
  );
  console.log(
    "Buy Account and Quote token:",
    quote_token_details.tokenName,

    await quote_token.methods.balanceOf(buy_account).call(),
    "Sell account and Base token:",
    base_token_details.tokenName,

    await base_token.methods.balanceOf(sell_account).call(),
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  );

  console.log(
    "Buy Account and Base token",
    await base_token.methods.balanceOf(buy_account).call(),
    "Sell account and Quote token",
    await quote_token.methods.balanceOf(sell_account).call(),
    "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&"
  );

  try {
    await quote_token.methods
      .approve(
        routerContract._address,
        await quote_token.methods.balanceOf(buy_account).call()
      )
      .send({ from: buy_account });
    await base_token.methods
      .approve(
        routerContract._address,
        await base_token.methods.balanceOf(sell_account).call()
      )
      .send({ from: sell_account });
  } catch (err) {
    console.log("error in approving quote token");
    console.log(err);
  }

  let path = [quote_token._address, base_token._address];
  const amountIn =
    quote_token_details.convertToRaw(1)

  // const initial_base_balance = BigInt(
  //   await quote_token.methods.balanceOf(buy_account).call()
  // );
  /**
   * Buy Tax
   */
  let trail1;
  try {
    trail1 = await routerContract.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        0,
        path,
        buy_account,
        2 ** 63
      )
      .call({ from: buy_account } | tx_params);
    console.log("success");
  } catch (err) {
    const msg = err.message;
    console.log(msg);
    if (msg.includes("ERC20: transfer amount exceeds balance")) {
      console.log("Insufficient balance");
    } else if (msg.includes("ERC20: transfer amount exceeds allowance")) {
      console.log("Insufficient allowance");
    } else if (
      msg.includes("TRANSFER_FAILED") | msg.includes("TRANSFER_FROM_FAILED")
    ) {
      console.log("Transfer failed");
    }
  }
  console.log(trail1);

  const receivedAmount = (
    await quote_token.methods.balanceOf(buy_account).call()
  );

  // console.log("received amount", receivedAmount);

  // if (receivedAmount <= 0) {
  //   console.log("100% tax");
  // }

  let uniswap_price = await routerContract.methods
    .getAmountsOut(amountIn, path)
    .call();

  console.log(uniswap_price);
  const buy_tax_percentage =
    (BigInt(uniswap_price[1]) - receivedAmount) / BigInt(uniswap_price[1]);
  console.log(buy_tax_percentage);

  /**
   * Transfer Tax
   */
  // try {
  //   await base_token.methods
  //     .transfer(sell_account, receivedAmount)
  //     .call({ from: buy_account });
  // } catch (err) {
  //   const msg = err.message;
  //   if (msg.includes("out of gas")) {
  //     console.log("Insufficient gas");
  //   } else {
  //     console.log("Transfer failed");
  //   }
  // }

  // const transfer_tax_percentage =
  //   (receivedAmount - recieved_amount_by_seller) / receivedAmount;

  // /**
  //  * Sell Tax
  //  */

  // path = [base_token._address, quote_token._address];
  // const recieved_amount_by_seller = BigInt(
  //   await base_token.methods.balanceOf(sell_account).call()
  // );

  // let sell_tax = 0;
  // let sell_tax_percentage = 0;

  // try {
  //   await router.methods
  //     .swapExactTokensForTokensSupportingFeeOnTransferTokens(
  //       recieved_amount_by_seller,
  //       0,
  //       path,
  //       sell_account,
  //       2 ** 63
  //     )
  //     .call({ from: sell_account });
  // } catch (err) {
  //   const msg = err.message.toString();
  //   console.log(msg);
  //   if (msg.includes("VM Exception while processing transaction: revert")) {
  //     console.log("sell failed");
  //   } else if (msg.includes("out of gas")) {
  //     console.log("Insufficient gas");
  //   }
  //   console.log(
  //     "swapExactTokensForTokensSupportingFeeOnTransferTokens failed while sell"
  //   );
  // }

  // const recieved_amount_after_sell = balances[0];
  // uniswap_price = await router.methods
  //   .getAmountsOut(recieved_amount_by_seller, path)
  //   .call();

  // if (recieved_amount_after_sell == 0) {
  //   console.log("100% sell tax");
  // }
  // sell_tax = uniswap_price[1] - recieved_amount_after_sell;
  // if (uniswap_price[1] > 0) {
  //   sell_tax_percentage = sell_tax / uniswap_price[1];
  // } else {
  //   sell_tax_percentage = 0;
  // }
  // console.log("sell tax percentage", sell_tax_percentage, sell_tax);
};

module.exports = { tokenTax };
