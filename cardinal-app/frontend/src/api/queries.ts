// Reads gold-layer JSON snapshots built by dbt and exported to the static site.
import type {
  Summary, PlantsData, DCNetwork, RetailerCompliance, ForecastData,
  POSData, TradePromotionData, CommodityData, SustainabilityData,
  PipelineData, IcebergData,
} from '../types';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  getSummary:        () => fetchJson<Summary>('/data/summary.json'),
  getPlants:         () => fetchJson<PlantsData>('/data/plants.json'),
  getDCs:            () => fetchJson<DCNetwork>('/data/dc_network.json'),
  getRetailers:      () => fetchJson<RetailerCompliance>('/data/retailer_compliance.json'),
  getForecast:       () => fetchJson<ForecastData>('/data/forecast.json'),
  getPOS:            () => fetchJson<POSData>('/data/pos_signal.json'),
  getTradePromotion: () => fetchJson<TradePromotionData>('/data/trade_promotion.json'),
  getCommodity:      () => fetchJson<CommodityData>('/data/commodity.json'),
  getSustainability: () => fetchJson<SustainabilityData>('/data/sustainability.json'),
  getPipeline:       () => fetchJson<PipelineData>('/data/pipeline.json'),
  getIceberg:        () => fetchJson<IcebergData>('/data/iceberg.json'),
};

export function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function fmtPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString();
}

export function signedPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '—';
  const s = n >= 0 ? '+' : '';
  return `${s}${n.toFixed(digits)}%`;
}
