# Honeypot

This is a scam token detection engine built to test tokens on various swaps currently supporting Uniswap, PancakeSwap, QuickSwap.

## API DOC:

- Response format: JSON
`{ buyTax, sellTax, error }`

## To Run and Test:

- Clone the repository
- Open a terminal in the repository folder
- Run `npm install`
- Run `node index.js`
- Open a browser and go to `localhost:3000/<tokenAddress>/<chainID>`
- Check console for results for Transfer and other Honeypot patterns
- Hit the goplus API `https://api.gopluslabs.io/api/v1/token_security/<chainID>?contract_addresses=<contractAddress>`
- Verify buy and sell taxes
