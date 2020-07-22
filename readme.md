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

### Create token

`yarn create-token`

This will generate metadata for the ad slot, upload to IPFS and then mint the ERC-721 token.

Auction creation is not yet implemented due to the fact that Infura does only allow raw transactions to be sent.

### Play with the blockchain 

- Read data from the contract: `npx oz call`
- Write data to the contract (**warning**: beware this changes and may break things): `npx oz send-tx`

## Structure

- .openzeppelin: information of deployed contracts, among other things 
- build/contracts: latest compiled contract
- contracts: the contracts
- src/services: business logic
- networks.js: OZ network config

# fuzzy-ads-nft-creation
