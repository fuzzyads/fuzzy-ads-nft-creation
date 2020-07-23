require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider(
  process.env.MNEMONICS,
  `https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`
);

const Web3 = require("web3");
const IPFS = require("ipfs");

const { getCurrentGasPrices } = require("../utils");

// Imports latest deployed smart contract ABI
const { abi } = require("../build/contracts/Ad.json");

// Imports latest deployed contract address on rinkeby
const rinkeby_deployment_data = require("../.openzeppelin/rinkeby.json");
const contract_address =
  rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"][
    rinkeby_deployment_data.proxies["fuzzy-ad-contracts/Ad"].length - 1
  ].address;

const web3 = new Web3(provider);

const base_ipfs_uri = "https://ipfs.io/ipfs/";

const start_time = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 3);
const expiration_time = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 6);

const nftContract = new web3.eth.Contract(abi, contract_address);

const generate_slot = () => {
  const name = `Ad Slot (1 day)`;
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
        value: start_time,
      },
      {
        display_type: "date",
        trait_type: "Advertisement ends at",
        value: expiration_time,
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
  const gas_prices = await getCurrentGasPrices();

  return await nftContract.methods
    .createAd(start_time, expiration_time, token_uri)
    .send({
      from: web3.eth.defaultAccount,
      gasPrice: gas_prices.low * 1000000000,
    });
};

(async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];

    const ad_slot_metadata = generate_slot();
    console.log("===> generated ad slot metadata");

    const token_uri = await store_on_ipfs(ad_slot_metadata);

    console.log(`===> stored metadata on ipfs at ${token_uri}`);

    console.log("===> will submit token mint transaction");
    const tx = await mint_token(token_uri);

    console.log("===> done. will stop");

    process.exit();
  } catch (e) {
    console.log(e);
  }
})();
