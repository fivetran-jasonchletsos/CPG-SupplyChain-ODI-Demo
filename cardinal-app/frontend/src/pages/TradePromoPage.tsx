import { useEffect, useState } from 'react';
import { api, fmtUSD, fmtNum, fmtPct } from '../api/queries';
import type { TradePromotionData, CustomersData } from '../types';
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
  const [customers, setCustomers] = useState<CustomersData | null>(null);
  useEffect(() => {
    api.getTradePromotion().then(setData).catch(() => {});
    api.getCustomers().then(setCustomers).catch(() => {});
  }, []);

  const running = data ? data.promotions.filter((p) => p.status === 'running') : [];
  const cutting = data ? data.promotions.filter((p) => p.recommendation.toLowerCase().startsWith('cut')).length : 0;
  const extending = data ? data.promotions.filter((p) => p.recommendation.toLowerCase().startsWith('extend')).length : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Trade Promotion + JBP"
        title="Trade-spend ROI, Joint Business Planning attainment, and the trade-spend agent"
        subtitle="$612M of trade spend YTD, 18.4M incremental cases, blended ROI 1.34. JBP commitments made at Q1 top-to-top with each top-10 retailer are tracked against actuals. The agent reads the promotion calendar from Salesforce, the dbt-built incrementality gold table, and weekly POS to recommend which promotions to extend, hold, or cut — and to flag JBP commitments at risk."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Trade spend YTD</div><div className="kpi-value num">{data ? fmtUSD(data.total_trade_spend_ytd_usd) : '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">Incremental volume</div><div className="kpi-value num">{data ? fmtNum(data.total_incremental_volume_ytd_cases) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">cases YTD</div></div>
        <div className="kpi-card"><div className="kpi-label">Blended ROI</div><div className="kpi-value num">{data ? data.blended_roi.toFixed(2) : '—'}x</div></div>
        <div className="kpi-card"><div className="kpi-label">Agent decisions</div><div className="kpi-value num">{extending} ext · {cutting} cut</div></div>
      </section>

      {customers && (
        <section className="surface mb-6">
          <div className="surface-head">
            <div className="eyebrow">JBP commitments — Q1 top-to-top vs actual</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Year-to-date attainment by top customer</h2>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Retailer</th>
                  <th>Customer-team lead</th>
                  <th className="num">JBP attainment</th>
                  <th>Status</th>
                  <th>At-risk pillar</th>
                </tr>
              </thead>
              <tbody>
                {customers.customers.slice(0, 10).map((c) => {
                  const atRisk = c.jbp_commitments.find((j) => j.status !== 'green');
                  return (
                    <tr key={c.id}>
                      <td className="font-semibold text-[var(--ink-strong)]">{c.alias}</td>
                      <td className="text-xs">{c.customer_team_lead}</td>
                      <td className="num" style={{ color: c.jbp_commitment_attainment_pct < 85 ? 'var(--red)' : c.jbp_commitment_attainment_pct < 92 ? 'var(--amber)' : 'var(--forest)' }}>{fmtPct(c.jbp_commitment_attainment_pct)}</td>
                      <td><span className={`pill ${c.jbp_status === 'green' ? 'good' : c.jbp_status === 'yellow' ? 'warn' : 'bad'}`}>{c.jbp_status}</span></td>
                      <td className="text-xs text-[var(--ink-muted)]">{atRisk ? `${atRisk.pillar} — ${atRisk.commitment}` : 'On plan'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data && (
        <section className="surface mb-6">
          <div className="surface-head">
            <div className="eyebrow">Lift vs cannibalization</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Net incremental cases by promotion</h2>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Promo</th>
                  <th>Brand / SKU</th>
                  <th>Retailer</th>
                  <th className="num">Lift cases</th>
                  <th className="num">Cannibalization</th>
                  <th className="num">Net incremental</th>
                  <th className="num">Cannibalization %</th>
                </tr>
              </thead>
              <tbody>
                {data.promotions.filter((p) => p.status === 'running').map((p) => {
                  const net = p.incremental_lift_cases - p.cannibalization_cases;
                  const cannPct = p.incremental_lift_cases ? (p.cannibalization_cases / p.incremental_lift_cases) * 100 : 0;
                  return (
                    <tr key={p.id}>
                      <td className="num">{p.id}</td>
                      <td><span className="font-semibold text-[var(--ink-strong)]">{p.brand}</span> <span className="num text-xs text-[var(--ink-soft)]">{p.sku}</span></td>
                      <td>{p.retailer}</td>
                      <td className="num text-[var(--forest)]">+{fmtNum(p.incremental_lift_cases)}</td>
                      <td className="num text-[var(--amber)]">-{fmtNum(p.cannibalization_cases)}</td>
                      <td className="num font-semibold text-[var(--ink-strong)]">{fmtNum(net)}</td>
                      <td className="num" style={{ color: cannPct > 20 ? 'var(--red)' : cannPct > 12 ? 'var(--amber)' : 'var(--forest)' }}>{cannPct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
