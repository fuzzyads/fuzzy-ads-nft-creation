const token = require("./commands/token");
const sell = require("./commands/sell");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    const {
      account,
      tokenId,
      expirationTime,
      startTime,
    } = await token.create();

    await sleep(30000); // open sea takes a bit to update

    /**
     * TODO: try...catch with n retries if fail
     * Open Sea may take a while to show
     */
    // expiration of sale is the start of ad period
    const sale = await sell.token({
      accountAddress: account.toLowerCase(),
      tokenId: tokenId,
      expirationTime: startTime,
      startAmount: 0.5,
    });

    console.log("===> token is up for sale.");

    process.exit();
  } catch (e) {
    console.log(e);
  }
})();
