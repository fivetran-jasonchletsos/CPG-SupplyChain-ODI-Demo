import { useEffect, useState } from 'react';
import { api, fmtUSD, fmtNum } from '../api/queries';
import type { TradePromotionData } from '../types';
import PageHeader from '../components/PageHeader';
import AgentCard from '../components/AgentCard';

function roiPill(roi: number) {
  if (roi >= 2.0) return 'good';
  if (roi >= 1.3) return 'neutral';
  if (roi >= 1.0) return 'warn';
  return 'bad';
}

export default function TradePromoPage() {
  const [data, setData] = useState<TradePromotionData | null>(null);
  useEffect(() => { api.getTradePromotion().then(setData).catch(() => {}); }, []);

  const running = data ? data.promotions.filter((p) => p.status === 'running') : [];
  const cutting = data ? data.promotions.filter((p) => p.recommendation.toLowerCase().startsWith('cut')).length : 0;
  const extending = data ? data.promotions.filter((p) => p.recommendation.toLowerCase().startsWith('extend')).length : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Trade Promotion"
        title="Trade-spend ROI and the trade-spend optimization agent"
        subtitle="$612M of trade spend YTD, 18.4M incremental cases, blended ROI 1.34. The agent reads the promotion calendar from Salesforce, the dbt-built incrementality gold table, and weekly POS to recommend which promotions to extend, hold, or cut."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Trade spend YTD</div><div className="kpi-value num">{data ? fmtUSD(data.total_trade_spend_ytd_usd) : '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">Incremental volume</div><div className="kpi-value num">{data ? fmtNum(data.total_incremental_volume_ytd_cases) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">cases YTD</div></div>
        <div className="kpi-card"><div className="kpi-label">Blended ROI</div><div className="kpi-value num">{data ? data.blended_roi.toFixed(2) : '—'}x</div></div>
        <div className="kpi-card"><div className="kpi-label">Agent decisions</div><div className="kpi-value num">{extending} ext · {cutting} cut</div></div>
      </section>

      {data?.trade_spend_agent && (
        <div className="mb-6">
          <AgentCard agent={data.trade_spend_agent} />
        </div>
      )}

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Active promotions</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Running today, {running.length} promos</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Promo</th>
                <th>Brand / SKU</th>
                <th>Retailer</th>
                <th className="num">Planned</th>
                <th className="num">Actual</th>
                <th className="num">Incr. cases</th>
                <th className="num">Cannibalization</th>
                <th className="num">ROI</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data?.promotions.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.id}</td>
                  <td><span className="font-semibold text-[var(--ink-strong)]">{p.brand}</span> <span className="num text-xs text-[var(--ink-soft)]">{p.sku}</span></td>
                  <td>{p.retailer}</td>
                  <td className="num">{fmtUSD(p.planned_spend_usd)}</td>
                  <td className="num">{fmtUSD(p.actual_spend_usd)}</td>
                  <td className="num">{fmtNum(p.incremental_lift_cases)}</td>
                  <td className="num text-[var(--amber)]">{fmtNum(p.cannibalization_cases)}</td>
                  <td className="num"><span className={`pill ${roiPill(p.roi)}`}>{p.roi.toFixed(2)}x</span></td>
                  <td className="text-xs">
                    <span className={p.recommendation.toLowerCase().startsWith('cut') ? 'text-[var(--red)] font-semibold' : p.recommendation.toLowerCase().startsWith('extend') ? 'text-[var(--forest)] font-semibold' : 'text-[var(--ink)]'}>
                      {p.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
