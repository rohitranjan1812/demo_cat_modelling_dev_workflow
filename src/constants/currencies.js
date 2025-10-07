/**
 * Currency Constants
 * 
 * Centralized definition of supported currencies.
 */

const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CNY: 'CNY',
  INR: 'INR',
  BRL: 'BRL'
};

const CURRENCY_VALUES = Object.values(CURRENCIES);

const CURRENCY_SYMBOLS = {
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.GBP]: '£',
  [CURRENCIES.JPY]: '¥',
  [CURRENCIES.CAD]: 'C$',
  [CURRENCIES.AUD]: 'A$',
  [CURRENCIES.CNY]: '¥',
  [CURRENCIES.INR]: '₹',
  [CURRENCIES.BRL]: 'R$'
};

const CURRENCY_NAMES = {
  [CURRENCIES.USD]: 'US Dollar',
  [CURRENCIES.EUR]: 'Euro',
  [CURRENCIES.GBP]: 'British Pound',
  [CURRENCIES.JPY]: 'Japanese Yen',
  [CURRENCIES.CAD]: 'Canadian Dollar',
  [CURRENCIES.AUD]: 'Australian Dollar',
  [CURRENCIES.CNY]: 'Chinese Yuan',
  [CURRENCIES.INR]: 'Indian Rupee',
  [CURRENCIES.BRL]: 'Brazilian Real'
};

module.exports = {
  CURRENCIES,
  CURRENCY_VALUES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
};
