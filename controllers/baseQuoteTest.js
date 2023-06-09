const BN = require("bn.js");
const { getRevertReason } = require("../utils/errorReason");

let functionJson = {
  swapExactTokensForETHSupportingFeeOnTransferTokens: false,
  swapExactTokensForTokensSupportingFeeOnTransferTokens: false,
  swapExactTokensForETH: false,
  swapExactTokensForTokens: false,
};

let functionError = {
  swapExactTokensForETHSupportingFeeOnTransferTokens: "",
  swapExactTokensForTokensSupportingFeeOnTransferTokens: "",
  swapExactTokensForETH: "",
  swapExactTokensForTokens: "",
};

const baseQuoteCall = async (amountIn, path, routerContract, account, web3) => {
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
    functionJson.swapExactTokensForTokensSupportingFeeOnTransferTokens = true;
    console.log(
      "success in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
  } catch (err) {
    console.log(
      "error in calling swapExactTokensForTokensSupportingFeeOnTransferTokens"
    );
    functionError.swapExactTokensForTokensSupportingFeeOnTransferTokens =
      err.message;
    console.log(err.receipt);

    const tx = await web3.eth.getTransaction(err.receipt.transactionHash);
    console.log("tx", tx);

    // let result = await web3.eth.call(tx, tx.blockNumber)
    // console.log("result", result);
    // result = result.startsWith("0x") ? result : `0x${result}`;
    // if (result && result.substr(138)) {
    //   const reason = web3.utils.toAscii(result.substr(138));
    //   console.log("Revert reason:", reason);
    //   functionError.swapExactTokensForTokensSupportingFeeOnTransferTokens = reason;
    // } else {
    //   console.log("Cannot get reason - No return value");
    // }


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
      functionJson.swapExactTokensForTokens = true;
      console.log("success in calling swapExactTokensForTokens");
    } catch (err) {
      console.log("error in calling swapExactTokensForTokens");
      functionError.swapExactTokensForTokens = err.message;
      console.log(err);

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
        functionJson.swapExactTokensForETHSupportingFeeOnTransferTokens = true;
        console.log(
          "success in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
        );
      } catch (err) {
        console.log(
          "error in calling swapExactTokensForETHSupportingFeeOnTransferTokens"
        );
        functionError.swapExactTokensForETHSupportingFeeOnTransferTokens =
          err.message;
        console.log(err);

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
          functionJson.swapExactTokensForETH = true;
          console.log("success in calling swapExactTokensForETH");
        } catch (err) {
          console.log("error in calling swapExactTokensForETH");
          functionError.swapExactTokensForETH = err.message;
          console.log(err);
        }
      }
    }
  }
  let returnJson = {};
  for (const [key, value] of Object.entries(functionJson)) {
    if (value === true) {
      console.log(key, "success");
      returnJson["functionCall"] = key;
      returnJson["error"] = "";
    } else {
      returnJson["error"] = functionError[key];
    }
  }
  return returnJson;
};

module.exports = { baseQuoteCall };
