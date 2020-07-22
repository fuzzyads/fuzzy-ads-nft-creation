require("dotenv").config();

const Web3 = require("web3");
const { OpenSeaPort, Network } = require("opensea-js");
const IPFS = require("ipfs");
const EthereumTx = require("ethereumjs-tx").Transaction;
const { setupLoader } = require("@openzeppelin/contract-loader");

const { getCurrentGasPrices } = require("../../utils");

// Imports latest deployed smart contract ABI
const { abi } = require("../../build/contracts/Ad.json");

// Imports latest deployed contract address on rinkeby
const rinkeby_deployment_data = require("../../.openzeppelin/rinkeby.json");
const contract_address =
  rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"][
    rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"].length - 1
  ].address;

// Initialized web3 provider
const provider = new Web3.providers.HttpProvider(
  `https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`
);
const web3 = new Web3(provider);

/**
 * Open Zeppelin (OZ) loader. Used for interacting with contracts deployed w OZ
 */
const ozLoader = setupLoader({
  provider,
}).web3;

/**
 * Open Sea
 */
const seaport = new OpenSeaPort(provider, {
  networkName: Network.Rinkeby,
});

const base_ipfs_uri = "https://ipfs.io/ipfs/";

const now = Math.round(Date.now() / 1000);
const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 3);
web3.eth.defaultAccount = process.env.WALLET_ADDRESS;

const generate_slot = () => {
  const name = `One Day - Ad Slot`;
  const description =
    "Advertise for **one day** on the fuzzy network by buying this slot.";
  const image_url =
    "https://ipfs.io/ipfs/QmVprAMVkhWoiMsTpTbY7amoM96w1syCXYXjFgyvwsJLoa";

  return {
    name,
    description,
    image_url,
    attributes: [
      {
        display_type: "date",
        trait_type: "Advertisement starts at",
        value: now,
      },
      {
        display_type: "date",
        trait_type: "Advertisement ends at",
        value: expirationTime,
      },
      {
        trait_type: "Slot",
        value: "Full day",
      },
      {
        trait_type: "Ad Type",
        value: "Banner",
      },
    ],
  };
};

// upload generated ad slot metadata to ipfs
const store_on_ipfs = async (ad_slot) => {
  const node = await IPFS.create({ silent: true }); // spin ipfs node

  const file = await node.add({
    content: Buffer.from(JSON.stringify(ad_slot)),
  });

  const hash = file.path;
  const token_uri = base_ipfs_uri + hash; // get hash and build tokenURI

  return token_uri;
};

const mint_token = async (token_uri) => {
  const contract = ozLoader.fromArtifact("Ad", contract_address);

  const account_balance_wei = await web3.eth.getBalance(
    web3.eth.defaultAccount
  );
  const account_balance_eth = web3.utils.fromWei(account_balance_wei, "ether");
  const nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
  const gas_prices = await getCurrentGasPrices();

  // build transaction
  const details = {
    nonce: nonce,
    gas: 550000,
    gasPrice: gas_prices.low * 1000000000,
    gasLimit: gas_prices.high * 1000000000,
    from: web3.eth.defaultAccount,
    to: contract_address,
    data: contract.methods
      .createAd(Math.round(Date.now() / 1000), token_uri)
      .encodeABI(),
    chainId: 4,
  };

  // create and send transaction
  const transaction = new EthereumTx(details, { chain: "rinkeby" });
  transaction.sign(Buffer.from(process.env.WALLET_PRIVATE_KEY, "hex"));
  const serialized_transaction = transaction.serialize();
  const transactionConfirmation = await web3.eth.sendSignedTransaction(
    "0x" + serialized_transaction.toString("hex")
  );

  return transactionConfirmation;
};

// create auction as a callback of a mint that succeeded
const create_auction = async (token_id) => {
  const contract = ozLoader.fromArtifact("Ad", contract_address);
  const val = await contract.methods.totalSupply().call();

  const auction = await seaport.createSellOrder({
    asset: {
      tokenId: token_id,
      tokenAddress: contract_address.toLowerCase(),
    },
    accountAddress: "0x1f777A796323c4a8F6C8c6B02d6D3727cAe664E4".toLowerCase(),
    startAmount: 3,
    expirationTime,
  });

  return auction;
};

(async () => {
  try {
    const ad_slot_metadata = generate_slot()
    console.log("===> generated ad slot metadata")

    const token_uri = await store_on_ipfs(ad_slot_metadata)

    console.log(`===> stored metadata on ipfs at ${token_uri}`)

    console.log("===> will submit token mint transaction")
    const tx = await mint_token(token_uri) 

    /*console.log("===> create auction");

    const auction = await create_auction(5);

    console.log(auction);*/

    console.log("===> done. will stop");

    process.exit();
  } catch (e) {
    console.log(e);
  }
})();
