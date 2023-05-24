const { ganacheConnection } = require("../ganache");
const BN = require("bn.js");
const { fetchTokenDetails } = require("./fetchErcDetails");
const { N } = require("ethers");

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

  const buy_account_balance = await quote_token_details.contract.methods
    .balanceOf(buy_account)
    .call();

  const sell_account_balance = await base_token_details.contract.methods
    .balanceOf(sell_account)
    .call();

  if (buy_account_balance !== 0) {
    console.log("Accounts already funded");
    try{
    await quote_token_details.contract.methods
      .transfer(
        "0xA93F74309D5631EbbC1E42FD411250A6b6240a69",
        buy_account_balance
      )
      .send({ from: buy_account });
    }catch(e){
      console.log(e);
    }
  }

  if (sell_account_balance !== 0) {
    console.log("Accounts already funded with quote token");
    try{
    await base_token_details.contract.methods
      .transfer(
        "0xA93F74309D5631EbbC1E42FD411250A6b6240a69",
        sell_account_balance
      )
      .send({ from: sell_account });
    }catch(e){
      console.log(e);
    }
  }

  console.log(
    await quote_token_details.contract.methods.balanceOf(buy_account).call(),
    await base_token_details.contract.methods.balanceOf(sell_account).call(),

    "INITIAL BALANCES"
  );

  console.log(quote_token_details.convertToRaw(1));

  // await quote_token_details.contract.methods
  //   .transfer(buy_account, quote_token_details.convertToRaw(1))
  //   .send({ from: sell_account });

  // await base_token_details.contract.methods
  //   .transfer(sell_account, base_token_details.convertToRaw(1))
  //   .send({ from: buy_account });

  console.log(
    await base_token_details.contract.methods.balanceOf(buy_account).call(),
    "BASE TOKEN : BUY ACCOUNT"
  );

  console.log(
    await quote_token_details.contract.methods.balanceOf(sell_account).call(),
    "QUOTE TOKEN : SELL ACCOUNT"
  );

};

module.exports = { populateEther };


//0x5c11d79500000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000075e89d5979e4f6fba9f97c104c2f0afb3f1dcb8800000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000000200000000000000000000000044aad22afbb2606d7828ca1f8f9e5af00e779ae1000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2