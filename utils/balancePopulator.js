const { ganacheConnection } = require("../ganache");
const BN = require("bn.js");
const { fetchTokenDetails } = require("./fetchErcDetails");

// /**
//  *
//  * @param {web3} web3 Instance of web3
//  * @param {buy_account} buy_account Base token Holder Account
//  * @param {sell_account} sell_account Quote token Holder Account
//  * @param {base_token} base_token Base token address
//  * @param {quote_token} quote_token Quote token address
//  *
//  * @returns {void} Funds the accounts with ether
//  *
//  * Funds buy_account with quote token
//  * Funds sell_account with base token
//  */
const populateEther = async (
  web3,
  buy_account,
  sell_account,
  base_token,
  quote_token
) => {
  // Checking whether we have our accounts from web3 instance unlocked, they will be present in n,n-1,n-2 positions of the array
  // console.log(
  //   await web3.eth.getAccounts(),
  //   "??????????????????????????????????????????????????????????????????????"
  // );
  // Checking whether control flow is with right token address and fetching token details

  // 0xAAC79BBe2EB28BEe33Cb568fcB06910d35d8328E
  console.log(base_token, quote_token, "+++++++++++++++++");
  console.log(buy_account, sell_account, "+++++++++++++++++");
  const base_token_details = await fetchTokenDetails(web3, base_token);
  const quote_token_details = await fetchTokenDetails(web3, quote_token);
  // Checking initial balances of the accounts

  await quote_token_details.contract.methods
    .transfer(
      buy_account,
      await quote_token_details.contract.methods.balanceOf(sell_account).call()
    )
    .send({ from: sell_account });

  await base_token_details.contract.methods
    .transfer(
      sell_account,
      await base_token_details.contract.methods.balanceOf(buy_account).call()
    )
    .send({ from: buy_account });

  console.log(
    await base_token_details.contract.methods.balanceOf(buy_account).call(),
    "BASE TOKEN : BUY ACCOUNT"
  );

  console.log(
    await quote_token_details.contract.methods.balanceOf(sell_account).call(),
    "QUOTE TOKEN : SELL ACCOUNT"
  );

  // // Funding buy_account with quote token
  // const quoteTokenFunding = await quote_token_details.contract.methods
  //   .transfer(
  //     buy_account,
  //     await quote_token_details.contract.methods.balanceOf(sell_account).call()
  //   )
  //   .send({ from: sell_account })
  //   .then((receipt) => console.log(receipt))
  //   .catch((err) => console.log('Error'));

  // // Funding sell_account with base token
  // const baseTokenTokenFunding = await base_token_details.contract.methods
  //   .transfer(
  //     sell_account,
  //     await base_token_details.contract.methods.balanceOf(buy_account).call()
  //   )
  //   .send({ from: buy_account })
  //   .then((receipt) => console.log(receipt))
  //   .catch((err) => console.log('Error'));

  //   const baseTokenReciept = await web3.eth.getTransactionReceipt(baseTokenTokenFunding).status;
  //   const quoteTokenReciept = await web3.eth.getTransactionReceipt(quoteTokenFunding).status;

  // // Checking final balances of the accounts after transfers
  // console.log(
  //   await base_token_details.contract.methods.balanceOf(sell_account).call(),
  //   "STATE CHANGE WITH TRANSFER"
  // );
  // console.log(
  //   await quote_token_details.contract.methods.balanceOf(buy_account).call(),
  //   "STATE CHANGE WITH TRANSFER"
  // );

  // return { baseTokenReciept, quoteTokenReciept };
};

module.exports = { populateEther };
