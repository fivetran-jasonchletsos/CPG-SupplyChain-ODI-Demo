import { useEffect, useState } from 'react';
import { api, fmtUSD, fmtPct } from '../api/queries';
import type { RetailerCompliance } from '../types';
import PageHeader from '../components/PageHeader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const REASON_COLORS = ['#b1182b', '#d97706', '#0d6e6e', '#4a4a4a', '#7a7a7a'];

const SCORECARD_RETAILERS: { alias: string; framework: string; grade: string; risk: string; grade_color: string }[] = [
  { alias: 'MegaMart Stores',       framework: 'MegaMart SQEP grid (MABD)', grade: 'C',  risk: '$4.2M Q3 chargeback exposure',    grade_color: 'var(--red)' },
  { alias: 'Bullseye Retail',       framework: 'Bullseye Vendor Scorecard', grade: 'B-', risk: 'JBP volume under-attained 7%',    grade_color: 'var(--amber)' },
  { alias: 'Beacon Club Warehouse', framework: 'Beacon Compliance Grid',    grade: 'A',  risk: 'Pallet integrity within band',    grade_color: 'var(--forest)' },
  { alias: 'AzureCart (online)',    framework: 'AzureCart Vendor Health',   grade: 'C+', risk: 'ASN 856 mismatch trending up',    grade_color: 'var(--red)' },
];

export default function RetailersPage() {
  const [data, setData] = useState<RetailerCompliance | null>(null);
  useEffect(() => { api.getRetailers().then(setData).catch(() => {}); }, []);

  const totalCB = data ? data.retailers.reduce((s, r) => s + r.chargebacks_ytd_usd, 0) : 0;
  const belowTarget = data ? data.retailers.filter((r) => r.otif_pct < r.otif_target_pct).length : 0;
  const avgOTIF = data ? data.retailers.reduce((s, r) => s + r.otif_pct, 0) / data.retailers.length : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Retailer Compliance"
        title="OTIF, chargebacks, and the 72-hour at-risk queue"
        subtitle="Top 30 retailer accounts ranked by volume. Chargeback dollars by reason — late delivery, short ship, label error, palletization (MABD violations), ASN mismatch, weight discrepancy. The retailer-compliance agent reads outbound orders, OTM tenders, WMS picks, and EDI 824 / 812 retailer chargeback feeds to flag at-risk shipments 36 to 72 hours before pickup with a proposed corrective action."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Avg OTIF (top 30)</div><div className="kpi-value num">{fmtPct(avgOTIF)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Accts below target</div><div className="kpi-value num" style={{ color: belowTarget > 10 ? 'var(--red)' : 'var(--amber)' }}>{belowTarget} / 30</div></div>
        <div className="kpi-card"><div className="kpi-label">Chargebacks YTD</div><div className="kpi-value num">{fmtUSD(totalCB)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Top exposure</div><div className="kpi-value num text-[var(--red)]">MegaMart</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">$14.2M YTD, OTIF 92.1%</div></div>
      </section>

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Retailer compliance frameworks</div>
          <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Vendor scorecards by retailer (synthetic, aliased)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {SCORECARD_RETAILERS.map((s) => (
            <div key={s.alias} className="border border-[var(--hairline)] rounded-sm p-4 bg-white">
              <div className="eyebrow mb-1">{s.framework}</div>
              <div className="font-serif text-base font-semibold text-[var(--ink-strong)]">{s.alias}</div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="num text-4xl font-semibold" style={{ color: s.grade_color }}>{s.grade}</span>
                <span className="text-[11px] text-[var(--ink-soft)] uppercase tracking-wider">grade</span>
              </div>
              <div className="text-xs text-[var(--ink-muted)] mt-2 leading-snug">{s.risk}</div>
            </div>
          ))}
        </div>
      </section>

      {data?.compliance_agent && (
        <section className="surface mb-6">
          <div className="surface-head">
            <div className="eyebrow">At-risk shipment queue, next 72 hours</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Retailer-compliance agent — proposed corrective actions</h2>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Shipment</th>
                  <th>Retailer</th>
                  <th>DC</th>
                  <th className="num">Pickup in</th>
                  <th>Risk</th>
                  <th>Reason</th>
                  <th>Proposed action</th>
                </tr>
              </thead>
              <tbody>
                {data.compliance_agent.at_risk_shipments?.map((s) => (
                  <tr key={s.id}>
                    <td className="num">{s.id}</td>
                    <td className="font-semibold text-[var(--ink-strong)]">{s.retailer}</td>
                    <td>{s.dc}</td>
                    <td className="num">{s.pickup_in_hours}h</td>
                    <td><span className={`pill ${s.risk === 'high' ? 'bad' : s.risk === 'medium' ? 'warn' : 'good'}`}>{s.risk}</span></td>
                    <td className="text-xs text-[var(--ink-muted)]">{s.reason}</td>
                    <td className="text-xs">{s.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4 text-xs text-[var(--ink-soft)]">
            {data.compliance_agent.summary}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="surface">
          <div className="surface-head">
            <div className="eyebrow">Chargeback mix</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">By reason code, $ YTD</h2>
          </div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.chargeback_reasons ?? []} dataKey="ytd_usd" nameKey="reason" cx="50%" cy="50%" outerRadius={100} label={(d: any) => `${d.pct_of_dollars}%`}>
                  {(data?.chargeback_reasons ?? []).map((_, i) => (
                    <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => fmtUSD(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 text-xs">
            {data?.chargeback_reasons.map((r, i) => (
              <div key={r.reason} className="flex items-center gap-2 py-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: REASON_COLORS[i % REASON_COLORS.length] }} />
                <span className="flex-1 text-[var(--ink)]">{r.reason}</span>
                <span className="num font-semibold text-[var(--ink-strong)]">{fmtUSD(r.ytd_usd)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface">
          <div className="surface-head">
            <div className="eyebrow">OTIF performance</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Top 12 retailers vs. target</h2>
          </div>
          <div className="p-4" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.retailers.slice(0, 12)} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ddcc" />
                <XAxis type="number" domain={[85, 100]} fontSize={11} />
                <YAxis type="category" dataKey="alias" fontSize={11} width={120} />
                <Tooltip formatter={(v: any) => `${(v as number).toFixed(1)}%`} />
                <Bar dataKey="otif_pct" radius={[0, 3, 3, 0]}>
                  {(data?.retailers.slice(0, 12) ?? []).map((r, i) => (
                    <Cell key={i} fill={r.otif_pct < r.otif_target_pct ? '#b1182b' : '#14532d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="surface-head">
          <div className="eyebrow">Top 30 retailers</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">OTIF, chargebacks, fines per 1,000 cases</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Retailer</th>
                <th>Channel</th>
                <th className="num">OTIF</th>
                <th className="num">Target</th>
                <th className="num">Chargebacks YTD</th>
                <th className="num">SLA perf</th>
                <th className="num">Fines per 1K cs</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data?.retailers.map((r) => (
                <tr key={r.id}>
                  <td className="num">{r.rank}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{r.alias}</td>
                  <td>{r.channel}</td>
                  <td className="num" style={{ color: r.otif_pct < r.otif_target_pct ? 'var(--red)' : 'var(--forest)' }}>{r.otif_pct.toFixed(1)}%</td>
                  <td className="num">{r.otif_target_pct.toFixed(0)}%</td>
                  <td className="num">{fmtUSD(r.chargebacks_ytd_usd)}</td>
                  <td className="num">{r.sla_perf_pct.toFixed(1)}%</td>
                  <td className="num">${r.fines_per_1000_cases_usd.toFixed(2)}</td>
                  <td>
                    <span className={`pill ${r.trend === 'up' ? 'good' : r.trend === 'down' ? 'bad' : 'neutral'}`}>{r.trend}</span>
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
