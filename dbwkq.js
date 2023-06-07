try {
    await router.methods
      .swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        0,
        path,
        buy_account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: buy_account, gas: 3000000 });
    console.log(
      "success in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    console.log(
      "error in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
    );
  }

  console.log(
    await quote_token.methods.balanceOf(buy_account).call(),
    "Transfer was indeed called"
  );

  const receivedAmount = await quote_token.methods
    .balanceOf(buy_account)
    .call();

  // console.log("received amount", receivedAmount);

  // if (receivedAmount <= 0) {
  //   console.log("100% tax");
  // }

  let uniswap_price = await routerContract.methods
    .getAmountsOut(amountIn, path)
    .call();

  let buyTax = (uniswap_price[1] - receivedAmount) / uniswap_price[1];

  console.log(uniswap_price);

  console.log(
    receivedAmount,
    " - Recieved amount",
    uniswap_price[1],
    " - Uniswap price"
  );

  console.log("Buy Tax Percentage", buyTax * 100, "%");

  /**
   * exact tokens for tokens
   */

  try {
    await routerContract.methods
      .swapExactTokensForTokens(
        amountIn,
        0,
        path,
        buy_account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: buy_account });
    console.log("success in transferring Exact tokens for tokens");
  } catch (err) {
    const msg = err;
    if (buyTax == 0 || buy_tax_error == undefined || buyTax == undefined) {
      buy_tax_error = err.message;
    }
    console.log("ERROR MESSAGE transferring Exact tokens for tokens");
  }

  /**
   * Transfer Tax
   */
  // try {
  //   await base_token.methods
  //     .transfer("0xBbefc461F6D944932EEea9C6d4c26C21e9cCeFB8", receivedAmount)
  //     .send({ from: buy_account });
  // } catch (err) {
  //   const msg = err.message;
  //   if (msg.includes("out of gas")) {
  //     console.log("Insufficient gas");
  //   } else {
  //     console.log("Transfer failed");
  //   }
  // }

  // const transfer_tax_percentage =
  //   (BigInt(await base_token.methods.balanceOf(buy_account).call()) -
  //     BigInt(
  //       await base_token.methods
  //         .balanceOf("0xBbefc461F6D944932EEea9C6d4c26C21e9cCeFB8")
  //         .call()
  //     )) /
  //   BigInt(await base_token.methods.balanceOf(buy_account).call());

  // console.log("transfer tax percentage", transfer_tax_percentage);

  /**
   * Sell Tax
   */
  console.log(quote_token_details.tokenName, "quote token name");

  let newpath = [quote_token._address, base_token._address];
  const recieved_amount_by_seller = await quote_token.methods
    .balanceOf(sell_account)
    .call();

  console.log("recieved amount by seller : ", recieved_amount_by_seller);

  let sell_tax = 0;
  let sell_tax_percentage = 0;
  let trail2 = "";
  try {
    trail2 = await router.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        recieved_amount_by_seller,
        0,
        newpath,
        sell_account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: sell_account, gas: 3000000 });
    console.log(
      "success in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    const msg = err;
    sell_tax_error = msg;
    console.log(
      "Error calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
    // if (msg.includes("VM Exception while processing transaction: revert")) {
    //   console.log("sell failed");
    // } else if (msg.includes("out of gas")) {
    //   console.log("Insufficient gas");
    // }
    console.log(
      "swapExactTokensForTokensSupportingFeeOnTransferTokens failed while sell"
    );
  }

  console.log(trail2);
  uniswap_price = await router.methods
    .getAmountsOut(recieved_amount_by_seller, path)
    .call();

  const recieved_Base_Amount = await base_token.methods
    .balanceOf(sell_account)
    .call();

  console.log("recieved base amount", recieved_Base_Amount);
  console.log("uniswap price", uniswap_price);
  sell_tax = (uniswap_price[1] - recieved_Base_Amount) / uniswap_price[1];
  console.log("sell tax", sell_tax);
  sell_tax_percentage = sell_tax * 100;
  console.log("sell tax percentage", sell_tax_percentage);

  try {
    await router.methods
      .swapExactETHForTokensSupportingFeeOnTransferTokens(
        recieved_amount_by_seller,
        0,
        newpath,
        sell_account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: sell_account, gas: 3000000 });
    console.log(
      "success in calling swapExactETHForTokensSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    console.log(
      "Error calling swapExactETHForTokensSupportingFeeOnTransferTokens"
    );
  }

  if (buyTax <= 0) buyTax = 0;
  if (sell_tax <= 0) sell_tax = 0;

  return { buyTax, sell_tax, buy_tax_error, sell_tax_error };