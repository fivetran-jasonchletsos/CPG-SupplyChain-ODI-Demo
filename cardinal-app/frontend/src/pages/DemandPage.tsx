import { useEffect, useState } from 'react';
import { api, fmtPct, fmtNum } from '../api/queries';
import type { ForecastData, POSData } from '../types';
import PageHeader from '../components/PageHeader';
import AgentCard from '../components/AgentCard';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

export default function DemandPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [pos, setPos] = useState<POSData | null>(null);

  useEffect(() => {
    api.getForecast().then(setForecast).catch(() => {});
    api.getPOS().then(setPos).catch(() => {});
  }, []);

  const latestMape = forecast?.mape_trend[forecast.mape_trend.length - 1]?.mape_pct;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Demand Planning"
        title="Forecast vs. actual, MAPE, and the demand-sensing agent"
        subtitle="A 13-week forecast across three categories. The demand-sensing agent rewrites the plan every six hours by reading retailer POS, syndicated panel, the promotion calendar, and short-range weather. Statistical engine + agent + planner work off the same Iceberg tables."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Current MAPE</div><div className="kpi-value num">{latestMape ? fmtPct(latestMape) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">target 15.0%</div></div>
        <div className="kpi-card"><div className="kpi-label">Horizon</div><div className="kpi-value num">{forecast?.horizon_weeks ?? '—'} wks</div></div>
        <div className="kpi-card"><div className="kpi-label">SKUs in scope</div><div className="kpi-value num">86,400</div></div>
        <div className="kpi-card"><div className="kpi-label">Distribution voids loss</div><div className="kpi-value num text-[var(--red)]">$2.4M/wk</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">est. lost sales, top 50 SKUs</div></div>
      </section>

      {forecast?.demand_sensing_agent && (
        <div className="mb-6">
          <AgentCard agent={forecast.demand_sensing_agent} />
        </div>
      )}

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Forecast vs. actual</div>
          <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Weekly cases by category (M)</h2>
        </div>
        <div className="p-4" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast?.weekly_by_category ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: any) => v == null ? '—' : `${(v as number).toFixed(1)}M cs`} />
              <Legend />
              <ReferenceLine x="Wk20" stroke="#b1182b" strokeDasharray="3 3" label={{ value: 'now', position: 'top', fontSize: 10, fill: '#b1182b' }} />
              <Line type="monotone" dataKey="food_bev_forecast" name="Food + Bev forecast" stroke="#b1182b" strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="food_bev_actual"   name="Food + Bev actual"   stroke="#b1182b" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="household_forecast" name="Household forecast" stroke="#14532d" strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="household_actual"   name="Household actual"   stroke="#14532d" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="personal_care_forecast" name="Personal Care forecast" stroke="#d97706" strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="personal_care_actual"   name="Personal Care actual"   stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Forecast accuracy</div>
          <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">MAPE trend, last 13 weeks</h2>
        </div>
        <div className="p-4" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast?.mape_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
              <XAxis dataKey="week" fontSize={11} />
              <YAxis fontSize={11} domain={[14, 24]} />
              <Tooltip formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
              <ReferenceLine y={15} stroke="#14532d" strokeDasharray="3 3" label={{ value: 'target 15%', position: 'right', fontSize: 10, fill: '#14532d' }} />
              <Line type="monotone" dataKey="mape_pct" stroke="#b1182b" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Worst forecast accuracy</div>
          <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Top 20 SKUs by MAPE</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Brand</th>
                <th>Description</th>
                <th>Category</th>
                <th className="num">MAPE</th>
                <th className="num">Weekly avg units</th>
                <th>Likely driver</th>
              </tr>
            </thead>
            <tbody>
              {forecast?.worst_skus.map((s) => (
                <tr key={s.sku}>
                  <td className="num">{s.sku}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{s.brand}</td>
                  <td>{s.description}</td>
                  <td>{s.category}</td>
                  <td className="num" style={{ color: s.mape_pct >= 30 ? 'var(--red)' : 'var(--amber)' }}>{s.mape_pct.toFixed(1)}%</td>
                  <td className="num">{fmtNum(s.weekly_avg_units)}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{s.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface">
        <div className="surface-head">
          <div className="eyebrow">POS signal — top SKU × retailer</div>
          <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Weekly POS, distribution voids, promo lift</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Brand</th>
                <th>Retailer</th>
                <th className="num">Weekly units</th>
                <th className="num">Weekly $</th>
                <th className="num">Void %</th>
                <th className="num">Promo lift</th>
              </tr>
            </thead>
            <tbody>
              {pos?.top_skus_by_retailer.map((r) => (
                <tr key={`${r.sku}-${r.retailer}`}>
                  <td className="num">{r.sku}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{r.brand}</td>
                  <td>{r.retailer}</td>
                  <td className="num">{fmtNum(r.weekly_pos_units)}</td>
                  <td className="num">${(r.weekly_pos_dollars_usd / 1000).toFixed(0)}K</td>
                  <td className="num" style={{ color: r.void_stores_pct > 3 ? 'var(--red)' : 'var(--ink)' }}>{r.void_stores_pct.toFixed(1)}%</td>
                  <td className="num" style={{ color: r.promo_lift_vs_base_pct > 20 ? 'var(--forest)' : 'var(--ink)' }}>+{r.promo_lift_vs_base_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
