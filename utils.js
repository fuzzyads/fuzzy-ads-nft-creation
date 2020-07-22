const axios = require("axios");

module.exports = {
  getCurrentGasPrices: async () => {
    const response = await axios.get(
      "https://ethgasstation.info/json/ethgasAPI.json"
    );
    const prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10,
    };
    return prices;
  },
};
