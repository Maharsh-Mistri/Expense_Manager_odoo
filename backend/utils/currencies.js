// Country to currency mapping
const countryCurrencyMap = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'India': 'INR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Germany': 'EUR',
  'France': 'EUR',
  'Spain': 'EUR',
  'Italy': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Japan': 'JPY',
  'China': 'CNY',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'South Korea': 'KRW',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Russia': 'RUB',
  'South Africa': 'ZAR',
  'United Arab Emirates': 'AED',
  'Saudi Arabia': 'SAR',
  'Turkey': 'TRY',
  'Indonesia': 'IDR',
  'Thailand': 'THB',
  'Malaysia': 'MYR',
  'Philippines': 'PHP',
  'Vietnam': 'VND',
  'New Zealand': 'NZD',
};

// Currency symbols
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'CNY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'SGD': 'S$',
  'HKD': 'HK$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'BRL': 'R$',
  'MXN': 'Mex$',
  'KRW': '₩',
  'ZAR': 'R',
  'AED': 'د.إ',
  'SAR': '﷼',
  'TRY': '₺',
  'IDR': 'Rp',
  'THB': '฿',
  'MYR': 'RM',
  'PHP': '₱',
  'VND': '₫',
  'NZD': 'NZ$',
  'PLN': 'zł',
  'RUB': '₽',
};

// Get currency from country
const getCurrencyFromCountry = (country) => {
  return countryCurrencyMap[country] || 'USD';
};

// Get currency symbol
const getCurrencySymbol = (currency) => {
  return currencySymbols[currency] || currency;
};

// Format currency amount
const formatCurrency = (amount, currency = 'USD') => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${parseFloat(amount).toFixed(2)}`;
};

// List of all countries
const countries = Object.keys(countryCurrencyMap).sort();

module.exports = {
  countryCurrencyMap,
  currencySymbols,
  getCurrencyFromCountry,
  getCurrencySymbol,
  formatCurrency,
  countries,
};
