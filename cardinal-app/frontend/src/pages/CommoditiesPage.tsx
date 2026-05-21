import { useEffect, useState } from 'react';
import { api, fmtUSD, fmtPct, signedPct } from '../api/queries';
import type { CommodityData } from '../types';
import PageHeader from '../components/PageHeader';

export default function CommoditiesPage() {
  const [data, setData] = useState<CommodityData | null>(null);
  useEffect(() => { api.getCommodity().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Commodity exposure"
        title="Six commodities driving Cardinal's input cost"
        subtitle="Corn, wheat, sugar, aluminum, polyethylene resin, and palm oil. CME-style spot and futures land via Fivetran every 15 minutes; dbt joins to hedge positions from the treasury system to produce mark-to-market gold."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Total exposure</div><div className="kpi-value num">{data ? fmtUSD(data.summary.total_exposure_usd) : '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">Weighted hedge</div><div className="kpi-value num">{data ? fmtPct(data.summary.weighted_hedge_pct) : '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">Net MtM unrealized</div><div className="kpi-value num" style={{ color: (data?.summary.net_mtm_unrealized_usd ?? 0) >= 0 ? 'var(--forest)' : 'var(--red)' }}>{data ? fmtUSD(data.summary.net_mtm_unrealized_usd) : '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">At-risk category</div><div className="text-sm font-semibold text-[var(--red)] mt-1 leading-snug">Palm oil unhedged exposure threatens $22M Q3 margin</div></div>
      </section>

      <section className="surface">
        <div className="surface-head">
          <div className="eyebrow">Commodity book</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Spot, 60-day change, hedge coverage, MtM</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Unit</th>
                <th className="num">Spot</th>
                <th className="num">60d Δ</th>
                <th className="num">Hedged 12mo</th>
                <th className="num">Exposure</th>
                <th className="num">MtM unrealized</th>
                <th>Drivers</th>
              </tr>
            </thead>
            <tbody>
              {data?.commodities.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-[var(--ink-strong)]">{c.name}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{c.unit}</td>
                  <td className="num">{c.spot.toLocaleString()}</td>
                  <td className="num" style={{ color: c.spot_60d_change_pct >= 10 ? 'var(--red)' : c.spot_60d_change_pct >= 0 ? 'var(--amber)' : 'var(--forest)' }}>{signedPct(c.spot_60d_change_pct)}</td>
                  <td className="num">{fmtPct(c.hedged_pct_12mo, 0)}</td>
                  <td className="num">{fmtUSD(c.exposure_usd)}</td>
                  <td className="num" style={{ color: c.mtm_unrealized_usd >= 0 ? 'var(--forest)' : 'var(--red)' }}>{fmtUSD(c.mtm_unrealized_usd)}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{c.drivers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
