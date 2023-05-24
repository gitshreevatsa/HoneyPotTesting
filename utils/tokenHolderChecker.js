const { funding } = require("./sendEther");
const { ganacheConnection } = require("../ganache");
const { fetchTokenDetails } = require("./fetchErcDetails");
const tokenHolders = async (
  web3,
  tokens,
  baseAddressHolders,
  quoteAddressHolders,
  network
) => {
  let i = 0;
  let base_address_holder = baseAddressHolders[0];
  let quote_address_holder = quoteAddressHolders[0];
  const baseTokenDetails = await fetchTokenDetails(web3, tokens[0]);
  const quoteTokenDetails = await fetchTokenDetails(web3, tokens[1]);

  console.log(await web3.eth.getAccounts());
  if (baseAddressHolders.length > 1) {
    while (
      base_address_holder == "0x0000000000000000000000000000000000000000" ||
      base_address_holder == "0x000000000000000000000000000000000000dead"
    ) {
      i++;
      base_address_holder = baseAddressHolders[i];
    }
  }

  let j = 0;
  if (quoteAddressHolders.length > 1) {
    while (
      quote_address_holder == "0x0000000000000000000000000000000000000000" ||
      quote_address_holder == "0x000000000000000000000000000000000000dead"
    ) {
      j++;
      quote_address_holder = quoteAddressHolders[j];
    }
  }
  const ganacheConnect = await ganacheConnection(
    network,
    base_address_holder,
    quote_address_holder
  );

  console.log(
    await baseTokenDetails.fetchBalanceOf(base_address_holder),
    await quoteTokenDetails.fetchBalanceOf(quote_address_holder)
  );

  const balances = [
    await baseTokenDetails.contract.methods
      .balanceOf(base_address_holder)
      .call(),
    await quoteTokenDetails.contract.methods
      .balanceOf(quote_address_holder)
      .call(),
  ];

  await funding(ganacheConnect.web3, base_address_holder);
  await funding(ganacheConnect.web3, quote_address_holder);

  return {
    ganacheConnect,
    base_address_holder,
    quote_address_holder,
    balances,
  };
};

module.exports = { tokenHolders };
