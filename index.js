const token = require("./commands/token");
const sell = require("./commands/sell");

(async () => {
  try {
    const {
      account,
      tokenId,
      expirationTime,
      startTime,
    } = await token.create();
    
    // expiration of sale is the start of ad period
    const sale = await sell.token({
      accountAddress: "0x1f777A796323c4a8F6C8c6B02d6D3727cAe664E4".toLowerCase(),
      tokenId: "6",
      expirationTime: 1595765921,
      startAmount: 0.5,
    });

    console.log("===> token is up for sale.")

    process.exit();
  } catch (e) {
    console.log(e);
  }
})();
