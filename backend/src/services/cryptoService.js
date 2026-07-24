const axios = require('axios');

const BASE_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
];

const CACHE_DURATION = 60 * 1000;
let priceCache = { data: null, timestamp: 0 };

const FALLBACK_PRICES = SUPPORTED_COINS.map((coin) => ({
  ...coin,
  price: coin.symbol === 'USDT' || coin.symbol === 'USDC' ? 1 : 0,
  change24h: 0,
  marketCap: 0,
}));

async function getPrices() {
  const now = Date.now();
  if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  try {
    const ids = SUPPORTED_COINS.map((c) => c.id).join(',');
    const response = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      },
      headers: { 'User-Agent': 'GoldenPrime/1.0' },
      timeout: 8000,
    });

    const prices = SUPPORTED_COINS.map((coin) => ({
      ...coin,
      price: response.data[coin.id]?.usd || 0,
      change24h: response.data[coin.id]?.usd_24h_change || 0,
      marketCap: response.data[coin.id]?.usd_market_cap || 0,
    }));

    priceCache = { data: prices, timestamp: now };
    return prices;
  } catch (err) {
    console.error('CoinGecko API error:', err.message);
    if (priceCache.data) return priceCache.data;
    return FALLBACK_PRICES;
  }
}

async function getCoinDetail(coinId) {
  const response = await axios.get(`${BASE_URL}/coins/${coinId}`, {
    params: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false,
    },
    headers: { 'User-Agent': 'GoldenPrime/1.0' },
    timeout: 10000,
  });

  const coin = response.data;
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    description: coin.description?.en || '',
    price: coin.market_data?.current_price?.usd || 0,
    change24h: coin.market_data?.price_change_percentage_24h || 0,
    change7d: coin.market_data?.price_change_percentage_7d || 0,
    marketCap: coin.market_data?.market_cap?.usd || 0,
    volume: coin.market_data?.total_volume?.usd || 0,
    high24h: coin.market_data?.high_24h?.usd || 0,
    low24h: coin.market_data?.low_24h?.usd || 0,
    image: coin.image?.large || '',
  };
}

module.exports = { getPrices, getCoinDetail, SUPPORTED_COINS };
