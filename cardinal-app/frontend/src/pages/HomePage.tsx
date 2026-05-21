import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fmtUSD, fmtPct, signedPct, fmtNum } from '../api/queries';
import type { Summary, PlantsData, DCNetwork, RetailerCompliance } from '../types';
import KpiTile from '../components/KpiTile';
import USNetworkMap from '../components/USNetworkMap';

export default function HomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [plants, setPlants] = useState<PlantsData | null>(null);
  const [dcs, setDcs] = useState<DCNetwork | null>(null);
  const [retailers, setRetailers] = useState<RetailerCompliance | null>(null);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(() => {});
    api.getPlants().then(setPlants).catch(() => {});
    api.getDCs().then(setDcs).catch(() => {});
    api.getRetailers().then(setRetailers).catch(() => {});
  }, []);

  const markers = [
    ...(plants?.owned ?? []).map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, kind: 'plant' as const })),
    ...(plants?.copack ?? []).map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, kind: 'copack' as const })),
    ...(dcs?.dcs ?? []).map((d) => ({ lat: d.lat, lon: d.lon, label: d.name, kind: 'dc' as const })),
    // Top 6 retailer HQs (approximate, fictional aliases — placeholder coords)
    { lat: 36.36, lon: -94.21, kind: 'retailer' as const, label: 'MegaMart HQ' },
    { lat: 39.10, lon: -84.51, kind: 'retailer' as const, label: 'RiverGrove HQ' },
    { lat: 47.61, lon: -122.34, kind: 'retailer' as const, label: 'BoxBin HQ' },
    { lat: 44.97, lon: -93.26, kind: 'retailer' as const, label: 'Bullseye HQ' },
    { lat: 33.96, lon: -118.27, kind: 'retailer' as const, label: 'AzureCart DC' },
    { lat: 38.90, lon: -77.04, kind: 'retailer' as const, label: 'Lighthouse Drug HQ' },
  ];

  return (
    <>
      <section className="bg-[var(--graphite)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden style={{
          backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 28px, rgba(255,199,204,0.5) 28px 29px)',
        }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="eyebrow-light mb-4">Cardinal Provisions, Open Data Infrastructure</div>
              <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-white leading-[0.98] tracking-tight">
                One lake.<br />
                <span style={{ color: '#ffc7cc' }}>Every plant. Every shelf.</span><br />
                Every agent.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                A CPG manufacturer-to-retailer control tower built on Fivetran's Open Data Infrastructure.
                SAP S/4HANA, Manhattan WMS, Oracle TMS, Salesforce, Walmart Retail Link, Amazon Vendor
                Central, Target Partners Online, Kroger Vendor Portal, syndicated panel, and carrier
                feeds all land in customer-owned Apache Iceberg. dbt builds the governed gold layer.
                Customer-team planners and agents read the same fresh tables.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/customers')}
                  className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-white px-5 py-3 shadow-lg hover:opacity-95 transition-opacity"
                  style={{ background: 'var(--crimson)' }}
                >
                  Open the customer scorecard <span aria-hidden>→</span>
                </button>
                <button
                  onClick={() => navigate('/architecture')}
                  className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-white px-5 py-3 border border-white/25 hover:bg-white/10"
                >
                  ODI architecture
                </button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                <HeroStat label="Net sales YTD" value={summary ? fmtUSD(summary.kpis.net_sales_ytd_usd) : '—'} sub={summary ? signedPct(summary.kpis.net_sales_ytd_yoy_pct) + ' YoY' : ''} />
                <HeroStat label="OTIF" value={summary ? fmtPct(summary.kpis.otif_score_pct) : '—'} sub={summary ? `target ${fmtPct(summary.kpis.otif_target_pct)}` : ''} warn />
                <HeroStat label="Forecast MAPE" value={summary ? fmtPct(summary.kpis.forecast_accuracy_mape_pct) : '—'} sub={summary ? `target ${fmtPct(summary.kpis.forecast_accuracy_target_mape_pct)}` : ''} warn />
                <HeroStat label="Days of supply" value={summary ? `${summary.kpis.days_of_supply}` : '—'} sub={summary ? `target ${summary.kpis.days_of_supply_target}d` : ''} warn />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {summary && (
            <>
              <KpiTile label="Net sales YTD"        value={fmtUSD(summary.kpis.net_sales_ytd_usd)}              delta={signedPct(summary.kpis.net_sales_ytd_yoy_pct) + ' YoY'} deltaKind={summary.kpis.net_sales_ytd_yoy_pct >= 0 ? 'up' : 'down'} />
              <KpiTile label="OTIF"                 value={fmtPct(summary.kpis.otif_score_pct)}                 delta={signedPct(summary.kpis.otif_yoy_pct_pts, 1) + ' pts'} deltaKind="warn" hint={`target ${fmtPct(summary.kpis.otif_target_pct)}`} />
              <KpiTile label="Fill rate"            value={fmtPct(summary.kpis.fill_rate_pct)}                  hint={`target ${fmtPct(summary.kpis.fill_rate_target_pct)}`} />
              <KpiTile label="Chargebacks YTD"      value={fmtUSD(summary.kpis.retailer_chargebacks_ytd_usd)}   delta={signedPct(summary.kpis.retailer_chargebacks_yoy_pct) + ' YoY'} deltaKind="down" />
              <KpiTile label="JBP attainment"       value={fmtPct(summary.kpis.jbp_attainment_pct)}             hint={`target ${fmtPct(summary.kpis.jbp_attainment_target_pct)}`} deltaKind="warn" />
              <KpiTile label="Top-10 customer mix"  value={fmtPct(summary.kpis.top10_revenue_concentration_pct)} hint="of net sales YTD" />
              <KpiTile label="Carrier OTD"          value={fmtPct(summary.kpis.carrier_otd_pct)}                hint={`target ${fmtPct(summary.kpis.carrier_otd_target_pct)}`} deltaKind="warn" />
              <KpiTile label="Forecast MAPE"        value={fmtPct(summary.kpis.forecast_accuracy_mape_pct)}     delta={`target ${fmtPct(summary.kpis.forecast_accuracy_target_mape_pct)}`} deltaKind="warn" />
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        <div className="lg:col-span-2 surface">
          <div className="surface-head">
            <div className="eyebrow">North America Network</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">11 plants, 18 co-pack, 9 DCs, top retailer HQs</h2>
          </div>
          <div className="p-4">
            <USNetworkMap markers={markers} height={420} />
            {dcs && (
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div><div className="text-[var(--ink-soft)]">Avg DOS</div><div className="num text-[var(--ink-strong)] font-semibold">{dcs.network_totals.avg_dos_days.toFixed(1)}d</div></div>
                <div><div className="text-[var(--ink-soft)]">Slow movers</div><div className="num text-[var(--ink-strong)] font-semibold">{fmtUSD(dcs.network_totals.total_slow_mover_dollars_usd)}</div></div>
                <div><div className="text-[var(--ink-soft)]">Daily throughput</div><div className="num text-[var(--ink-strong)] font-semibold">{fmtNum(dcs.network_totals.total_daily_throughput_cases)} cases</div></div>
              </div>
            )}
          </div>
        </div>

        <div className="surface">
          <div className="surface-head">
            <div className="eyebrow">On the CSCO's desk</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Top 3 issues this week</h2>
          </div>
          <div className="p-4 space-y-4">
            {summary?.top_issues.map((issue) => (
              <a key={issue.id} href={issue.link} className="block border-l-4 pl-3 py-2 hover:bg-[var(--cream)] transition-colors"
                 style={{ borderColor: issue.severity === 'high' ? 'var(--red)' : issue.severity === 'medium' ? 'var(--amber)' : 'var(--forest)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`pill ${issue.severity === 'high' ? 'bad' : issue.severity === 'medium' ? 'warn' : 'good'}`}>{issue.severity}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">{issue.owner}</span>
                </div>
                <div className="text-sm font-semibold text-[var(--ink-strong)] leading-snug">{issue.title}</div>
                <div className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">{issue.detail}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary?.categories.map((c) => (
            <div key={c.category} className="surface p-4">
              <div className="eyebrow mb-1">Category</div>
              <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{c.category}</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="num text-2xl font-semibold text-[var(--ink-strong)]">{fmtUSD(c.net_sales_usd)}</div>
                <div className={`num text-sm font-semibold ${c.growth_yoy_pct >= 0 ? 'text-[var(--forest)]' : 'text-[var(--red)]'}`}>{signedPct(c.growth_yoy_pct)}</div>
              </div>
              <div className="text-xs text-[var(--ink-soft)] mt-1">{fmtPct(c.share_pct, 0)} of mix</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="surface p-5">
          <div className="eyebrow mb-1">Retailer compliance pulse</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">OTIF at the top 30 retailers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {retailers?.retailers.slice(0, 10).map((r) => (
              <div key={r.id} className="border border-[var(--hairline)] rounded-sm p-3 bg-white">
                <div className="text-[11px] text-[var(--ink-soft)] uppercase tracking-wider">#{r.rank} {r.channel}</div>
                <div className="text-sm font-semibold text-[var(--ink-strong)] truncate">{r.alias}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className={`num text-lg font-semibold ${r.otif_pct >= r.otif_target_pct ? 'text-[var(--forest)]' : 'text-[var(--red)]'}`}>{r.otif_pct.toFixed(1)}%</span>
                  <span className="text-[10px] text-[var(--ink-soft)]">tgt {r.otif_target_pct.toFixed(0)}%</span>
                </div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 num">{fmtUSD(r.chargebacks_ytd_usd)} CB</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <a href="#/retailers" className="text-sm font-semibold text-[var(--crimson-dark)] hover:underline">Open retailer dashboard →</a>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="rounded-sm border border-white/15 p-3 bg-white/5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{label}</div>
      <div className="font-serif text-2xl font-semibold text-white mt-1 num">{value}</div>
      {sub && <div className={`text-[11px] mt-1 ${warn ? 'text-[#ffc7cc]' : 'text-white/65'}`}>{sub}</div>}
    </div>
  );
}
