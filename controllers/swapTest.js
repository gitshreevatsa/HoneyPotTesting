const { fetchTokenDetails, TokenDetails } = require("../utils/fetchErcDetails");
// YET TO WORK ON THIS
// Test
// Add error classes
// figure return types
// add liquidity to buy and sell accounts
const tokenTax = (
  web3, // web3 instance: ganache hard fork
  router, // router contract
  base_token_address,// base token address
  quote_token_address, // quote token address
  buy_account, // ganache account
  sell_account, // ganache account
  buy_amount,
  approve,
  gas_limit,
  gas_price
) => {
  approve = true;
  const Web3 = web3;
  const routerContract = router;

  console.log(
    quote_token_address,
    base_token_address,
    buy_account,
    sell_account,
    buy_amount
  );

  const quote_token_details = fetchTokenDetails(Web3, quote_token_address);
  const quote_token = quote_token_details.contract;

  const base_token_details = fetchTokenDetails(Web3, base_token_address);
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

  if (approve) {
    quote_token.methods
      .approve(routerContract, quote_token_details.convertToRaw(buy_amount))
      .transact({ from: buy_account } | tx_params);
  }

  const path = [quote_token.address, base_token.address];
  const amountIn = quote_token_details.convertToRaw(buy_amount);

  const initial_base_balance = base_token.methods.balanceOf(buy_account).call();

  /**
   * Buy Tax
   */
  try {
    routerContract.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        0,
        path,
        buy_account,
        2 ** 63
      )
      .transact({ from: buy_account } | generic_tx_params);
  } catch (err) {
    const msg = err.message;
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

  const receivedAmount =
    base_token.methods.balanceOf(buy_account).call() - initial_base_balance;

  if ((receivedAmount = 0)) {
    console.log("100% tax");
  }

  const uniswap_price = routerContract.methods
    .getAmountsOut(amountIn, path)
    .call()[1];

  const buy_tax_percentage = (uniswap_price - receivedAmount) / uniswap_price;
  /**
   * Transfer Tax
   */
  try {
    base_token.methods
      .transfer(sell_account, receivedAmount)
      .transact({ from: buy_account } | tx_params);
  } catch (err) {
    const msg = err.message;
    if (msg.contains("out of gas")) {
      console.log("Insufficient gas");
    } else {
      console.log("Transfer failed");
    }
  }

  const recieved_amount_by_seller = base_token.methods
    .balanceOf(sell_account)
    .call();

  const transfer_tax_percentage =
    (receivedAmount - recieved_amount_by_seller) / receivedAmount;

  /**
   * Sell Tax
   */

  path = [base_token.address, quote_token.address];

  const sell_tax = 0;
  const sell_tax_percentage = 0;

  try {
    router.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        recieved_amount_by_seller,
        0,
        path,
        sell_account,
        2 ** 63
      )
      .transact({ from: sell_account } | generic_tx_params);
  } catch (err) {
    const msg = err.message;
    if (msg.contains("VM Exception while processing transaction: revert")) {
      console.log("sell failed");
    } else if (msg.contains("out of gas")) {
      console.log("Insufficient gas");
    }
    console.log(
      "swapExactTokensForTokensSupportingFeeOnTransferTokens failed while sell"
    );
  }

  const recieved_amount_after_sell = quote_token.methods
    .balanceOf(sell_account)
    .call();
  uniswap_price = router.methods
    .getAmountsOut(recieved_amount_by_seller, path)
    .call()[1];

  if (recieved_amount_after_sell == 0) {
    console.log("100% tax");
    sell_tax = uniswap_price - recieved_amount_after_sell;
    if (uniswap_price > 0) {
      sell_tax_percentage = sell_tax / uniswap_price;
    } else {
      sell_tax_percentage = 0;
    }
  }
};

module.exports = { tokenTax };
