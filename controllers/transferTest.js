const transferTest = async (account, token) => {
  const oldBalance = await token.contract.methods.balanceOf(account).call();
  console.log(oldBalance, "oldBalance");

  let newBalance, transferError, transferTax;
  try {
    await token.contract.methods
      .transfer("0xA93F74309D5631EbbC1E42FD411250A6b6240a69", oldBalance)
      .send({ from: account, gas: 210000 });
    newBalance = await token.contract.methods
      .balanceOf("0xA93F74309D5631EbbC1E42FD411250A6b6240a69")
      .call();
    transferTax = oldBalance - newBalance;
  } catch (e) {
    console.log(e);
    transferError = e.message;
  }
  return { oldBalance, newBalance, transferError, transferTax };
};

module.exports = { transferTest };
