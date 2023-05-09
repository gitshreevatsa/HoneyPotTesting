const { ganacheConnection } = require("../ganache");
const BN = require("bn.js");
const { fetchTokenDetails } = require("./fetchErcDetails");

// get holders of a given address, put them into unlocker accounts, and transfer tokens from them to my address and simulate transfer

const populateEther = async (
  web3,
  buy_account,
  sell_account,
  base_token,
  quote_token
) => {
  console.log(
    web3,
    "??????????????????????????????????????????????????????????????????????"
  );
  // transfer tokens to both address as much as buy_amount
  console.log(base_token, quote_token, "+++++++++++++++++");
  const base_token_details = await fetchTokenDetails(web3, base_token);
  const quote_token_details = await fetchTokenDetails(web3, quote_token);
  console.log(base_token_details, "**********************");

  await web3.eth.sendTransaction({
    from: "0x0000000000000000000000000000000000000000",
    to: buy_account,
    value: "0x" + new BN("100000000000000", 10).toString(16),
    // gas: 21000
  });

  await web3.eth.sendTransaction({
    from: "0x0000000000000000000000000000000000000000",
    to: sell_account,
    value: "0x" + new BN("10000000000000000", 10).toString(16),
    // gas: 21000
  });

  const tx = await quote_token_details.contract.methods
    .transfer(
      buy_account,
      await quote_token_details.contract.methods.balanceOf(sell_account).call()
    )
    .send({ from: sell_account });
  tx;
  await base_token_details.contract.methods
    .transfer(
      sell_account,
      await base_token_details.contract.methods.balanceOf(buy_account).call()
    )

    .send({ from: buy_account });
  console.log(
    await base_token_details.contract.methods.balanceOf(sell_account).call(),
    "++++++++++++++++++++++++++++++"
  );
  console.log(
    await quote_token_details.contract.methods.balanceOf(buy_account).call(),
    "++++++++++++++++++++++++++++++"
  );
};

module.exports = { populateEther };
