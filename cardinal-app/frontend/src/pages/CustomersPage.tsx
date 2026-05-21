import { useEffect, useMemo, useState } from 'react';
import { api, fmtUSD, fmtPct, fmtNum } from '../api/queries';
import type { Customer, CustomersData } from '../types';
import PageHeader from '../components/PageHeader';
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ReferenceLine, Legend,
} from 'recharts';

type Tab = 'otif' | 'chargebacks' | 'jbp' | 'pos' | 'promos' | 'carrier' | 'launches';

const REASON_COLORS = ['#b1182b', '#d97706', '#0d6e6e', '#4a4a4a', '#7a7a7a', '#a16207'];

function statusPill(s: 'green' | 'yellow' | 'red') {
  if (s === 'green') return 'good';
  if (s === 'yellow') return 'warn';
  return 'bad';
}

export default function CustomersPage() {
  const [data, setData] = useState<CustomersData | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('otif');

  useEffect(() => { api.getCustomers().then(setData).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.customers;
    return data.customers.filter((c) =>
      c.alias.toLowerCase().includes(q) ||
      c.channel.toLowerCase().includes(q) ||
      c.customer_team_lead.toLowerCase().includes(q),
    );
  }, [data, query]);

  const selected = useMemo(
    () => data?.customers.find((c) => c.id === selectedId) ?? null,
    [data, selectedId],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Customer Accounts"
        title="Top 30 retailer accounts, every shelf in their grid"
        subtitle="One row per retail customer. Revenue, OTIF, chargeback dollars, JBP commitment status, last-week POS, active trade promotions, and the customer-team lead who owns it. Click a row for the full retailer scorecard: OTIF trend, chargeback decomposition, JBP commitments vs Q1 top-to-top, POS-vs-forecast by SKU, promo lift, carrier OTD, and new-item launch tracking."
      />

      {data && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="kpi-card">
            <div className="kpi-label">Avg OTIF (top 30)</div>
            <div className="kpi-value num">{fmtPct(data.summary.avg_otif_pct)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Top-10 revenue concentration</div>
            <div className="kpi-value num">{fmtPct(data.summary.top10_revenue_concentration_pct)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">JBP attainment</div>
            <div className="kpi-value num" style={{ color: data.summary.jbp_attainment_pct >= 92 ? 'var(--forest)' : 'var(--amber)' }}>{fmtPct(data.summary.jbp_attainment_pct)}</div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-1">target 92%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Chargebacks YTD</div>
            <div className="kpi-value num text-[var(--red)]">{fmtUSD(data.summary.chargeback_ytd_usd)}</div>
          </div>
        </section>
      )}

      <section className="surface mb-6">
        <div className="surface-head flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="eyebrow">Retailer scorecard</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Top 30 customer accounts</h2>
          </div>
          <input
            type="search"
            placeholder="Filter by retailer, channel, or team lead…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-[var(--hairline)] rounded-sm px-3 py-1.5 text-sm bg-white w-full sm:w-80"
          />
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Retailer</th>
                <th>Channel</th>
                <th className="num">YTD revenue</th>
                <th className="num">YTD OTIF</th>
                <th className="num">YTD chargebacks</th>
                <th>JBP status</th>
                <th className="num">Last wk POS units</th>
                <th className="num">Active promos</th>
                <th>Customer-team lead</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer hover:bg-[var(--cream)]"
                  onClick={() => { setSelectedId(c.id); setTab('otif'); }}
                >
                  <td className="num">{c.rank}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{c.alias}</td>
                  <td>{c.channel}</td>
                  <td className="num">{fmtUSD(c.ytd_revenue_usd)}</td>
                  <td className="num" style={{ color: c.ytd_otif_pct < 93 ? 'var(--red)' : c.ytd_otif_pct < 95 ? 'var(--amber)' : 'var(--forest)' }}>{c.ytd_otif_pct.toFixed(1)}%</td>
                  <td className="num">{fmtUSD(c.ytd_chargebacks_usd)}</td>
                  <td><span className={`pill ${statusPill(c.jbp_status)}`}>{c.jbp_status}</span></td>
                  <td className="num">{fmtNum(c.last_week_pos_units)}</td>
                  <td className="num">{c.active_promos}</td>
                  <td className="text-xs">{c.customer_team_lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <CustomerDetail customer={selected} tab={tab} onTab={setTab} onClose={() => setSelectedId(null)} />
      )}

      {data && (
        <section className="surface">
          <div className="surface-head">
            <div className="eyebrow">Customer-team scorecard</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Portfolio roll-up by customer-team lead</h2>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Retailers</th>
                  <th className="num">Portfolio revenue</th>
                  <th className="num">Portfolio OTIF</th>
                  <th className="num">JBP attainment</th>
                </tr>
              </thead>
              <tbody>
                {data.team_scorecard.map((t) => (
                  <tr key={t.lead}>
                    <td className="font-semibold text-[var(--ink-strong)]">{t.lead}</td>
                    <td className="text-xs">{t.retailers.join(', ')}</td>
                    <td className="num">{fmtUSD(t.portfolio_revenue_usd)}</td>
                    <td className="num" style={{ color: t.portfolio_otif_pct < 93 ? 'var(--red)' : 'var(--ink)' }}>{t.portfolio_otif_pct.toFixed(1)}%</td>
                    <td className="num" style={{ color: t.jbp_attainment_pct < 85 ? 'var(--red)' : t.jbp_attainment_pct < 92 ? 'var(--amber)' : 'var(--forest)' }}>{t.jbp_attainment_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function CustomerDetail({
  customer, tab, onTab, onClose,
}: { customer: Customer; tab: Tab; onTab: (t: Tab) => void; onClose: () => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'otif',        label: 'OTIF trend' },
    { key: 'chargebacks', label: 'Chargeback breakdown' },
    { key: 'jbp',         label: 'JBP commitments' },
    { key: 'pos',         label: 'POS vs forecast' },
    { key: 'promos',      label: 'Trade promos' },
    { key: 'carrier',     label: 'Carrier OTD' },
    { key: 'launches',    label: 'New-item launches' },
  ];

  return (
    <section className="surface mb-6" style={{ borderColor: 'var(--crimson)' }}>
      <div className="surface-head flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">Retailer detail</div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)]">{customer.alias}</h2>
          <div className="text-xs text-[var(--ink-soft)] mt-1">
            {customer.channel} · {customer.banner_type} · primary lane to {customer.primary_dc} · Customer-team lead {customer.customer_team_lead}
          </div>
        </div>
        <button onClick={onClose} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink-strong)] border border-[var(--hairline)] rounded-sm px-3 py-1">
          Close
        </button>
      </div>

      <div className="px-4 pt-3 border-b border-[var(--hairline)] flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`text-[12px] font-semibold uppercase tracking-wider px-3 py-2 border-b-2 -mb-px whitespace-nowrap ${
              tab === t.key ? 'border-[var(--crimson)] text-[var(--ink-strong)]' : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'otif' && (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customer.otif_trend_8wk}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} domain={[88, 100]} />
                <Tooltip formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <ReferenceLine y={95} stroke="#14532d" strokeDasharray="3 3" label={{ value: 'target 95%', position: 'right', fontSize: 10, fill: '#14532d' }} />
                <Line type="monotone" dataKey="otif_pct" stroke="#b1182b" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 'chargebacks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customer.chargeback_breakdown} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
                  <XAxis type="number" fontSize={11} tickFormatter={(v: any) => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="reason" fontSize={10} width={160} />
                  <Tooltip formatter={(v: any) => fmtUSD(v as number)} />
                  <Bar dataKey="ytd_usd" radius={[0, 3, 3, 0]}>
                    {customer.chargeback_breakdown.map((_, i) => (
                      <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="eyebrow mb-2">Compliance grid view</div>
              <div className="text-sm text-[var(--ink-muted)] mb-3">
                YTD chargebacks <span className="num font-semibold text-[var(--ink-strong)]">{fmtUSD(customer.ytd_chargebacks_usd)}</span> — distilled from EDI 824 and 812 feeds via Fivetran, joined to the dbt-built shipment fact.
              </div>
              <ul className="space-y-1 text-xs">
                {customer.chargeback_breakdown.map((r, i) => (
                  <li key={r.reason} className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: REASON_COLORS[i % REASON_COLORS.length] }} />
                    <span className="flex-1 text-[var(--ink)]">{r.reason}</span>
                    <span className="num font-semibold text-[var(--ink-strong)]">{fmtUSD(r.ytd_usd)}</span>
                    <span className="num text-[var(--ink-soft)] ml-2">{r.pct_of_dollars}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'jbp' && (
          <div>
            <div className="text-sm text-[var(--ink-muted)] mb-3">
              JBP commitments made at Q1 top-to-top with {customer.alias}. Volume, distribution, and promotion pillars tracked against actuals.
              Attainment <span className="font-semibold text-[var(--ink-strong)]">{customer.jbp_commitment_attainment_pct.toFixed(1)}%</span>.
            </div>
            <div className="overflow-x-auto">
              <table className="data">
                <thead>
                  <tr>
                    <th>Pillar</th>
                    <th>Commitment</th>
                    <th className="num">Target</th>
                    <th className="num">Actual</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.jbp_commitments.map((c, i) => {
                    const pct = c.target ? (c.actual / c.target) * 100 : 0;
                    return (
                      <tr key={i}>
                        <td className="font-semibold text-[var(--ink-strong)]">{c.pillar}</td>
                        <td>{c.commitment}</td>
                        <td className="num">{fmtNum(c.target)} {c.unit}</td>
                        <td className="num" style={{ color: pct < 90 ? 'var(--red)' : pct < 100 ? 'var(--amber)' : 'var(--forest)' }}>{fmtNum(c.actual)} {c.unit}</td>
                        <td><span className={`pill ${statusPill(c.status)}`}>{c.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'pos' && (
          <div>
            {customer.pos_by_sku_last_4wk.length === 0 ? (
              <div className="text-sm text-[var(--ink-soft)]">No SKU-level POS extract attached for this account this week.</div>
            ) : (
              <>
                <div className="text-sm text-[var(--ink-muted)] mb-3">
                  Last 4 weeks of retailer POS by SKU vs the Cardinal 13-week forecast. Sourced from {customer.alias}'s portal via Fivetran (hourly), joined to dbt forecast gold.
                </div>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customer.pos_by_sku_last_4wk.map((p) => ({ ...p, key: `${p.sku} ${p.week_label}` }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
                      <XAxis dataKey="key" fontSize={10} angle={-20} textAnchor="end" height={60} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v: any) => fmtNum(v as number) + ' units'} />
                      <Legend />
                      <Bar dataKey="forecast_units" name="Forecast" fill="#7a7a7a" />
                      <Bar dataKey="pos_units"      name="POS actual" fill="#b1182b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'promos' && (
          <div>
            {customer.active_promo_detail.length === 0 ? (
              <div className="text-sm text-[var(--ink-soft)]">No active promotions at {customer.alias} this week.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Promo</th>
                      <th>Brand / SKU</th>
                      <th>Status</th>
                      <th className="num">Lift vs base</th>
                      <th className="num">Cannibalization</th>
                      <th>Ends</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.active_promo_detail.map((p) => (
                      <tr key={p.id}>
                        <td className="num">{p.id}</td>
                        <td><span className="font-semibold text-[var(--ink-strong)]">{p.brand}</span> <span className="num text-xs text-[var(--ink-soft)]">{p.sku}</span></td>
                        <td>{p.status}</td>
                        <td className="num text-[var(--forest)]">+{p.lift_pct.toFixed(1)}%</td>
                        <td className="num text-[var(--amber)]">-{p.cannibalization_pct.toFixed(1)}%</td>
                        <td>{p.end_week}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'carrier' && (
          <div className="flex flex-col items-start gap-2">
            <div className="text-sm text-[var(--ink-muted)]">
              Carrier on-time delivery to {customer.primary_dc}, last 4 weeks. Joined from OTM tender events and carrier portal feeds.
            </div>
            <div className="num text-5xl font-semibold" style={{ color: customer.carrier_otd_to_dc_pct < 90 ? 'var(--red)' : customer.carrier_otd_to_dc_pct < 95 ? 'var(--amber)' : 'var(--forest)' }}>
              {customer.carrier_otd_to_dc_pct.toFixed(1)}%
            </div>
            <div className="text-xs text-[var(--ink-soft)]">target 95.0%</div>
          </div>
        )}

        {tab === 'launches' && (
          <div>
            {customer.new_item_launches.length === 0 ? (
              <div className="text-sm text-[var(--ink-soft)]">No items launched at {customer.alias} in the last 90 days.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Brand</th>
                      <th>Launched</th>
                      <th className="num">Doors distributed</th>
                      <th className="num">Doors target</th>
                      <th className="num">Weekly velocity</th>
                      <th className="num">Distribution %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.new_item_launches.map((l) => {
                      const dist = l.doors_target ? (l.doors_distributed / l.doors_target) * 100 : 0;
                      return (
                        <tr key={l.sku}>
                          <td className="num">{l.sku}</td>
                          <td className="font-semibold text-[var(--ink-strong)]">{l.brand}</td>
                          <td>{l.launched_week}</td>
                          <td className="num">{fmtNum(l.doors_distributed)}</td>
                          <td className="num">{fmtNum(l.doors_target)}</td>
                          <td className="num">{fmtNum(l.weekly_velocity_units)}</td>
                          <td className="num" style={{ color: dist < 85 ? 'var(--red)' : dist < 95 ? 'var(--amber)' : 'var(--forest)' }}>{dist.toFixed(0)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
