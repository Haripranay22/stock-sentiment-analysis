import axios from "axios";

const client = axios.create({ baseURL: "http://localhost:8000" });

export const fetchDashboard = (days = 7) =>
  client.get(`/dashboard?days=${days}`).then((r) => r.data);

export const fetchStocks = () =>
  client.get("/stocks").then((r) => r.data);

export const fetchPrices = (ticker, days = 30) =>
  client.get(`/stocks/${ticker}/prices?days=${days}`).then((r) => r.data);

export const fetchNews = (ticker, days = 7) =>
  client.get(`/stocks/${ticker}/news?days=${days}&limit=30`).then((r) => r.data);

export const fetchSentiment = (ticker, days = 7) =>
  client.get(`/stocks/${ticker}/sentiment?days=${days}`).then((r) => r.data);

export const fetchSentimentHistory = (ticker, days = 30) =>
  client.get(`/stocks/${ticker}/sentiment-history?days=${days}`).then((r) => r.data);

export const fetchRankings = (days = 7) =>
  client.get(`/rankings?days=${days}`).then((r) => r.data);

export const fetchSectors = (days = 7) =>
  client.get(`/sectors?days=${days}`).then((r) => r.data);

export const triggerEtl = (payload = {}) =>
  client.post("/etl/run", { price_days: 30, news_days: 7, ...payload }).then((r) => r.data);
