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
  console.log(
    await web3.eth.getAccounts(),
    "??????????????????????????????????????????????????????????????????????"
  );
  // Checking whether control flow is with right token address and fetching token details
  console.log(base_token, quote_token, "+++++++++++++++++");
  const base_token_details = await fetchTokenDetails(web3, base_token);
  const quote_token_details = await fetchTokenDetails(web3, quote_token);
  // Checking initial balances of the accounts
  console.log(
    await base_token_details.contract.methods.balanceOf(buy_account).call(),
    "BASE TOKEN : BUY ACCOUNT"
  );
  console.log(
    await quote_token_details.contract.methods.balanceOf(sell_account).call(),
    "QUOTE TOKEN : SELL ACCOUNT"
  );
  // Funding the accounts with ether
  await web3.eth.sendTransaction({
    from: "0x0000000000000000000000000000000000000000",
    to: buy_account,
    value: "0x" + new BN("100000000000000000", 10).toString(16),
    // gas: 21000
  });

  await web3.eth.sendTransaction({
    from: "0x0000000000000000000000000000000000000000",
    to: sell_account,
    value: "0x" + new BN("100000000000000000", 10).toString(16),
    // gas: 21000
  });

  // Funding buy_account with quote token
  await quote_token_details.contract.methods
    .transfer(
      buy_account,
      await quote_token_details.contract.methods.balanceOf(sell_account).call()
    )
    .send({ from: sell_account });

  // Funding sell_account with base token
  await base_token_details.contract.methods
    .transfer(
      sell_account,
      await base_token_details.contract.methods.balanceOf(buy_account).call()
    )
    .send({ from: buy_account });

  // Checking final balances of the accounts after transfers
  console.log(
    await base_token_details.contract.methods.balanceOf(sell_account).call(),
    "STATE CHANGE WITH TRANSFER"
  );
  console.log(
    await quote_token_details.contract.methods.balanceOf(buy_account).call(),
    "STATE CHANGE WITH TRANSFER"
  );
};

module.exports = { populateEther };
