import { useEffect, useState } from 'react';
import { api, fmtPct, signedPct, fmtNum } from '../api/queries';
import type { SustainabilityData } from '../types';
import PageHeader from '../components/PageHeader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SC3_COLORS = ['#b1182b', '#861121', '#d97706', '#a76309', '#14532d', '#0d6e6e', '#7a7a7a'];

export default function ESGPage() {
  const [data, setData] = useState<SustainabilityData | null>(null);
  useEffect(() => { api.getSustainability().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="ESG and EPR"
        title="Scope 1, 2, 3 emissions, packaging, water, state-by-state EPR"
        subtitle="The sustainability data warehouse lands via Fivetran. dbt unifies emissions with production, shipment, and packaging facts to produce intensity metrics per case and EPR-ready compliance views."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Scope 1 YTD</div><div className="kpi-value num">{data ? fmtNum(data.emissions.scope1_mt_co2e_ytd) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">mt CO2e · {data ? signedPct(data.emissions.scope1_yoy_pct) : '—'} YoY</div></div>
        <div className="kpi-card"><div className="kpi-label">Scope 2 YTD</div><div className="kpi-value num">{data ? fmtNum(data.emissions.scope2_mt_co2e_ytd) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">mt CO2e · {data ? signedPct(data.emissions.scope2_yoy_pct) : '—'} YoY</div></div>
        <div className="kpi-card"><div className="kpi-label">Scope 3 YTD</div><div className="kpi-value num">{data ? fmtNum(data.emissions.scope3_mt_co2e_ytd) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">mt CO2e · {data ? signedPct(data.emissions.scope3_yoy_pct) : '—'} YoY</div></div>
        <div className="kpi-card"><div className="kpi-label">Scope 3 intensity</div><div className="kpi-value num">{data ? data.emissions.scope3_intensity_kg_per_case.toFixed(2) : '—'}</div><div className="text-[11px] text-[var(--ink-soft)] mt-1">kg/case · target {data?.emissions.intensity_target_2030_kg_per_case.toFixed(2)} by 2030</div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="surface">
          <div className="surface-head">
            <div className="eyebrow">Scope 3 breakdown</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">By category share, YTD</h2>
          </div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.scope3_breakdown ?? []} dataKey="share_pct" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={(d: any) => `${d.share_pct}%`}>
                  {(data?.scope3_breakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={SC3_COLORS[i % SC3_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface">
          <div className="surface-head">
            <div className="eyebrow">Packaging and water</div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Recyclability, recycled content, water intensity</h2>
          </div>
          <div className="p-4 space-y-4">
            {data && (
              <>
                <ProgressBar label="Recyclable packaging" value={data.packaging.recyclable_share_pct} target={data.packaging.recyclable_target_2030_pct} suffix="%" />
                <ProgressBar label="Recycled content in packaging" value={data.packaging.recycled_content_pct} target={data.packaging.recycled_content_target_2030_pct} suffix="%" />
                <ProgressBar label="Compostable share" value={data.packaging.compostable_share_pct} target={20} suffix="%" />
                <div className="border-t border-[var(--hairline-soft)] pt-4">
                  <div className="text-[11px] text-[var(--ink-soft)] uppercase tracking-wider mb-2">Water</div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><div className="text-[11px] text-[var(--ink-soft)]">YTD withdrawal</div><div className="num font-semibold text-[var(--ink-strong)]">{fmtNum(data.water.withdrawal_megaliters_ytd)} ML</div></div>
                    <div><div className="text-[11px] text-[var(--ink-soft)]">L per case</div><div className="num font-semibold text-[var(--ink-strong)]">{data.water.withdrawal_intensity_l_per_case.toFixed(1)}</div></div>
                    <div><div className="text-[11px] text-[var(--ink-soft)]">High-stress basin</div><div className="num font-semibold text-[var(--amber)]">{fmtPct(data.water.high_stress_basin_share_pct, 0)}</div></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="surface-head">
          <div className="eyebrow">Extended Producer Responsibility (EPR)</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">State-by-state packaging compliance</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>State</th>
                <th>Law</th>
                <th>Status</th>
                <th>Next filing</th>
                <th>Risk note</th>
              </tr>
            </thead>
            <tbody>
              {data?.epr_state_compliance.map((s) => (
                <tr key={s.state}>
                  <td className="font-semibold text-[var(--ink-strong)] num">{s.state}</td>
                  <td>{s.law}</td>
                  <td>
                    <span className={`pill ${s.status === 'compliant' ? 'good' : s.status === 'at_risk' ? 'bad' : 'warn'}`}>{s.status.replace('_', ' ')}</span>
                  </td>
                  <td className="num">{s.next_filing}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{s.risk_note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ProgressBar({ label, value, target, suffix }: { label: string; value: number; target: number; suffix: string }) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-[var(--ink)]">{label}</span>
        <span className="num text-[var(--ink-strong)] font-semibold">{value}{suffix} <span className="text-[var(--ink-soft)] font-normal">of {target}{suffix} target</span></span>
      </div>
      <div className="h-2 rounded-full bg-[var(--cream-deep)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--crimson) 0%, var(--forest) 100%)' }} />
      </div>
    </div>
  );
}
