const BN = require("bn.js");

const funding = async (web3, account) => {
  console.log(account);
  let accountReciept;
  const AccountFunding = await web3.eth
    .sendTransaction({
      from: "0x0000000000000000000000000000000000000000",
      to: account,
      value: "0x" + new BN("1000000000000000000000", 10).toString(16),
      // gas: 21000
    })
    .then(async (receipt) => {
      accountReciept = receipt.status;
    })
    .catch((err) => {
      console.log("ERROR");
      accountReciept = false;
    });
  AccountFunding;
  return { accountReciept };
};

module.exports = { funding };
