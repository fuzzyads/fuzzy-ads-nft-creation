require("dotenv").config();

const MnemonicWalletSubprovider = require("@0x/subproviders")
  .MnemonicWalletSubprovider;
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");
const { OpenSeaPort, Network } = require("opensea-js");
const Web3 = require("web3");

const rinkeby_deployment_data = require("../.openzeppelin/rinkeby.json");
const contract_address =
  rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"][
    rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"].length - 1
  ].address;

const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
  mnemonic: process.env.MNEMONICS,
  baseDerivationPath: BASE_DERIVATION_PATH,
});
const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`,
});

const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWalletSubprovider);
providerEngine.addProvider(infuraRpcSubprovider);
providerEngine.start();

const seaport = new OpenSeaPort(providerEngine, {
  networkName: Network.Rinkeby,
});

module.exports = {
  token: async ({
    accountAddress,
    tokenId,
    expirationTime,
    startAmount
  }) => {
    return await seaport.createSellOrder({
      asset: {
        tokenId: tokenId,
        tokenAddress: contract_address,
      },
      startAmount,
      endAmount: startAmount/2,
      expirationTime: expirationTime,
      accountAddress: accountAddress,
    });
  },
};
