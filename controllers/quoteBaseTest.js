const BN = require("bn.js");
const { ethers } = require("ethers");

const quoteBaseCall = async (amountIn, path, routerContract, account) => {
  try {
    await routerContract.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        0,
        path,
        account,
        new BN("99999999999999").toNumber()
      )
      .send({ from: account, gas: '0xF4240', gasPrice: '0x4A817C800' });
    console.log(
      "success in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    console.log(
      "error in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
    console.log(err.message);

    try {
      await routerContract.methods
        .swapExactTokensForTokens(
          amountIn,
          0,
          path,
          account,
          new BN("99999999999999").toNumber()
        )
        .send({ from: account,  gas: '0xF4240', gasPrice: '0x4A817C800' });
      console.log("success in calling swapExactTokensForTokens");
    } catch (err) {
      console.log("error in calling swapExactTokensForTokens");
      console.log(err.message);

      try {
        await routerContract.methods
          .swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            path,
            account,
            new BN("99999999999999").toNumber()
          )
          .send({ from: account,  gas: '0xF4240', gasPrice: '0x4A817C800', value: amountIn });
        console.log(
          "success in calling swapExactETHForTokensSupportingFeeOnTransferTokens"
        );
      } catch (err) {
        console.log(
          "error in calling swapExactETHForTokensSupportingFeeOnTransferTokens"
        );
        console.error(err.message);
        try {
            
          await routerContract.methods
            .swapETHForExactTokens(
              0,
              path,
              account,
              new BN("99999999999999").toNumber()
            )
            .send({ from: account,  gas: '0xF4240', gasPrice: '0x4A817C800', value: amountIn });
          console.log("success in calling swapETHForExactTokens");
        } catch (err) {
          console.log("error in calling swapETHForExactTokens");
          console.error(err.message);
        }
      }
    }
  }
};

module.exports = { quoteBaseCall };
