# Fuzzy Ads | NFT service

### What is this? 

This project allows you to:
- Deploy and interact with smart contracts on the blockchain (rinkeby **only**, for now)
- Mint NFT tokens
- Store data on IPFS
- List the tokens for sale on Open Sea

## How to

Be sure to use node 10.x

### Install

`yarn`

### Create token and create auction

`node .`

This will generate metadata for the ad slot, upload to IPFS and then mint the ERC-721 token.

It creates an auction on Open Sea. 

### Play with the blockchain 

- Read data from the contract: `npx oz call`
- Write data to the contract (**warning**: beware this changes and may break things): `npx oz send-tx`

