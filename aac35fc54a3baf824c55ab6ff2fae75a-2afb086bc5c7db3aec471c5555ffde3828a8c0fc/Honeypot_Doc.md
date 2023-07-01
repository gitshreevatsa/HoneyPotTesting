# Honeypot Checker Implementation and Logic

## Overview

The honeypot checker allows user to query the legitimacy and liquidity of a token. Currently it uses Ganache 7 Ethereum Simulator to simulate and determine the token parameters.

Currently the checks involve checking for liquidity in Uniswap,PancakeSwap and quickswap.
The LiquidityPools and the token pairs are obtained and the following checks are done in the forked simulated environment

- Swap for quote token/WETH/WBNB for base token (Buy)

- Swap for base token for WETH/WBNB/Quote_token (sell)

- Calculate Buy tax and Sell tax based on the difference in simulation and AmountOut value.

The results are returned as follows based on different conditions.

- A honeypot token
- Buy tax
- Sell tax
- Why its a honeypot token if it is one.

# Logical Implementation :

## Folder : abi

- abi/erc20.json : Contains ABI of a simple ERC20 token
- abi/pancake.json : Contains ABI of pancakeswap
- abi/uniswap.json : Contains ABI of uniswap
- abi/uniswapV2.json : Contains ABI of uniswap pair contract

## Folder : controllers

- controllers/baseQuoteTest.js : Contains the logic for selling the base token. Simulates the 4 swapping mechanisms for swapping :

  - swapExactTokensForTokensSupportingFeeOnTransferTokens : Swaps the base token for quote token with fee in base token
  - swapExactTokensForTokens : Swaps the base token for quote token
  - swapExactTokensForETHSupportingFeeOnTransferTokens : Swaps the base token for WETH with fee in base token
  - swapExactTokensForETH : Swaps the base token for WETH

- controllers/quoteBaseTest.js : Contains the logic for buying the base token

  - swapExactTokensForTokensSupportingFeeOnTransferTokens : Swaps the quote token for base token with fee in quote token
  - swapExactTokensForTokens : Swaps the quote token for base token with fee in native token
  - swapExactTokensForETHSupportingFeeOnTransferTokens : Swaps the quote token for WETH with fee in quote token
  - swapExactTokensForETH : Swaps the quote token for WETH

- controllers/swapTest.js : Contains the logic for calling the above 2 files for swapping and based on results obtained, calculates the buy and sell tax. It uses:

  - getAmountsOut : Gets the amount of tokens out for a given amount of tokens in or native token in, function of the router contract
  - Balance of user of the counter token post swap
  - Using above 2 it calculates the tax for buy and sell

- controllers/transferTest.js : Contains the logic for transfering the token to another address and checking if the transfer was successful.
  - transfer : Transfers the token to another address and checks if the transfer was successful by checking the balance of the receiver address and calulating the difference in balance for tax calculation.

## Folder : utils

- utils/addresses.js : gets the address holders of the token, dex name and pair contract address. The address holders consist of EOA holders, or LP holders or the owner.
- utils/arrayChecker.js : rechecks if token holder of quote token holders is same as base token holders and returns true or false for the /addresses.js file to take another address is same
- utils/balancePopulator.js : removes any quote token from base token holder and any base token from quote token holder
- utils/balanceRechecker.js : Rechecks the balance of the given token holders by directly querying the blockchain and returns a new array of actual token holders
- utils/fetchErcDetails.js : Class to fetch the token details like name, decimals, balanceOf an address.
- utils/provider.js : Creates a provider for the web3 instance of 3 different chains
- utils/sendEther.js : Sends ether to an address of about 0.1 ETH
- utils/tokenHolderChecker.js : Eliminates the dead address from the token holders array
- utils/uniswapV2.js : Creates a uniswapV2 pair contract instance and retreives the quote token for a given pair address obtained from /addresses.js

## ganache.js :

- ganache.js : Creates a ganache instance by unlockcing particular wallets required and forks the mainnet. Creates a router contract instance as well and returns, the ganache instance, router contract instance.

## index.js :

Entry file to the application which has an endpoit support of /:id/:chain where id corresponds to token address and chain corresponds to chain id. It then does the following :

- Gets the holder address for base token along with pair and dex name by calling utils/addresses.js
- Creates a V2 pair contract instance by calling utils/uniswapV2.js and gets the quote token address
- Gets the holder address for quote token utils/addresses.js andchecks if the holders are same by calling utils/arrayChecker.js, is same then it will take LP holder address or the owner
- Recalculates the holders by calling utils/balanceRechecker.js and gets back an array of actual address holders
- Checks if the token holders are dead addresses by calling utils/tokenHolderChecker.js and gets back an object of base token holders and quote token holders
- Initiates a ganache instance by calling ganache.js and gets back ganache instance and router contract instance
- Sends ether to the base token holder and quote token holder by calling utils/sendEther.js of the ganache instance
- Fetches the token details by calling utils/fetchErcDetails.js of base token and quote token
- Removes any quote token from base token holder and any base token from quote token holder by calling utils/balancePopulator.js
- Calls the controllers/swapTest.js for buy and sell tax calculation and gets back the results
- Response sent with `{buyTax, sellTax, isHoneypot, honeyPotReason, dexname, pair}`


# Tech stack and Supported chains

## Tech stack:

- Ganache 7 Ethereum Simulator
- Web3.js
- Node.js
- Express.js

## Supported chains:

- Ethereum
- Binance Smart Chain
- Polygon

# All possible Conditions and responses



# Usage doc :
```npm install```

```node index.js```

```/token_address/chain_id```

# Upcoming development and features
- Add more chains
- Add more checks for tokens not in any dex
