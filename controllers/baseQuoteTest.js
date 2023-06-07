const BN = require("bn.js");

const baseQuoteCall = async (amountIn, path, routerContract, account) => {
  try {
    await routerContract.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        0,
        path,
        account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: account, gas: 3000000 });
    console.log(
      "success in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    console.log(
      "error in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
    try {
      await routerContract.methods
        .swapExactTokensForTokens(
          amountIn,
          0,
          path,
          account,
          new BN("99999999999999").toNumber()
        )
        .send({ from: account, gas: 3000000 });
      console.log("success in calling swapExactTokensForTokens");
    } catch (err) {
      console.log("error in calling swapExactTokensForTokens");
      try {
        await routerContract.methods
          .swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            path,
            account,
            new BN("99999999999999").toNumber()
          )
          .send({ from: account, gas: 3000000 });
        console.log(
          "success in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
        );
      } catch (err) {
        console.log(
          "error in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
        );
        try {
          await routerContract.methods
            .swapExactTokensForETH(
              amountIn,
              0,
              path,
              account,
              new BN("99999999999999").toNumber()
            )
            .send({ from: account, gas: 3000000 });
          console.log("success in calling swapExactTokensForETH");
        } catch (err) {
          console.log("error in calling swapExactTokensForETH");
        }
      }
    }
  }
};

module.exports = { baseQuoteCall };