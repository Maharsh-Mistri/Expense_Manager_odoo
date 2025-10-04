 const axios = require('axios');

const getCountries = async () => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch countries');
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error('Currency conversion rate not found');
    }

    return amount * rate;
  } catch (error) {
    throw new Error('Currency conversion failed');
  }
};

module.exports = { getCountries, convertCurrency };

