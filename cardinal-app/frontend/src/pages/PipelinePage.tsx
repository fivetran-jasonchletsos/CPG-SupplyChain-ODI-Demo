import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtNum } from '../api/queries';
import type { PipelineData } from '../types';
import PageHeader from '../components/PageHeader';

const FIVETRAN_BASE = 'https://fivetran.com/dashboard/connectors';
const FIVETRAN_DASHBOARD_URL = 'https://fivetran.com/dashboard/connections';

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => { api.getPipeline().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Data Pipeline"
        title="SAP, WMS, retailer POS, panel &rarr; Iceberg &rarr; multi-engine, end-to-end"
        subtitle="Fivetran lands every CDC row into Iceberg (MDLS) on S3. Snowflake, Athena, and Trino read the same Iceberg bytes via external catalogs &mdash; no copies, no extracts. Fivetran Transformations triggers dbt Labs the moment the source sync finishes; bronze, silver, and gold all stay in Iceberg."
      />

      {/* Canonical flow: Source -> Fivetran -> Iceberg (MDLS) -> Compute -> dbt -> React */}
      <section className="surface p-5 mb-8">
        <div className="eyebrow mb-3">Canonical flow</div>
        <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            { stage: '01', label: 'Source', sub: 'SAP, WMS, OMS, POS, panel' },
            { stage: '02', label: 'Fivetran', sub: 'CDC + batch connectors' },
            { stage: '03', label: 'Iceberg (MDLS)', sub: 'Open table format on S3 — one copy of the bytes' },
            { stage: '04', label: 'Snowflake / Athena / Trino', sub: 'External Iceberg reads' },
            { stage: '05', label: 'dbt Labs', sub: 'Triggered by Fivetran — bronze, silver, gold in Iceberg' },
            { stage: '06', label: 'React', sub: 'Planner workbench + CSCO console' },
          ].map((s, i, arr) => (
            <li
              key={s.stage}
              className="relative border border-[var(--hairline)] rounded-sm p-3 bg-white"
              style={i === 2 ? { borderLeft: '3px solid var(--crimson)' } : undefined}
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] num">{s.stage}</div>
              <div className="font-serif text-sm font-semibold text-[var(--ink-strong)] mt-0.5 leading-tight">
                {s.label}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)] mt-1 leading-snug">{s.sub}</div>
              {i < arr.length - 1 && (
                <span
                  aria-hidden
                  className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
                >
                  &rarr;
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {data?.layers.map((l) => (
          <div key={l.layer} className="surface p-4">
            <div className="eyebrow mb-2">{l.layer}</div>
            <div className="num text-2xl font-semibold text-[var(--ink-strong)]">{l.table_count}</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">tables, {l.row_count_billions.toFixed(1)}B rows, {l.size_tb.toFixed(1)} TB</div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-1">freshness {l.freshness_minutes} min</div>
          </div>
        ))}
      </section>

      <section className="surface mb-8">
        <div className="surface-head flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="eyebrow">Connectors</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">All flowing through Fivetran</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://fivetran.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="btn-fivetran"
            >
              Open in Fivetran
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <button
              onClick={() => setSimulateFailure((s) => !s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-sm border ${
                simulateFailure
                  ? 'bg-[var(--red-bg)] text-[var(--red)] border-[var(--red)]/30'
                  : 'bg-white text-[var(--ink-muted)] border-[var(--hairline)] hover:bg-[var(--cream)]'
              }`}
            >
              {simulateFailure ? 'Simulating Retail Link failure' : 'Simulate Retail Link failure'}
            </button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Connector ID</th>
                <th>Category</th>
                <th>Status</th>
                <th className="num">Sync freq</th>
                <th className="num">Rows 24h</th>
                <th className="num">Lag</th>
                <th>Notes</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {data?.connectors.map((c) => {
                const isRetailLink = c.id === 'walmart_retail_link';
                const status = simulateFailure && isRetailLink ? 'failed' : c.status;
                return (
                  <tr key={c.id}>
                    <td className="font-semibold text-[var(--ink-strong)]">{c.name}</td>
                    <td><span className="connector-id">{c.fivetran_id}</span></td>
                    <td>{c.category}</td>
                    <td>
                      <span className={`pill ${status === 'healthy' ? 'good' : status === 'degraded' ? 'warn' : 'bad'}`}>{status}</span>
                    </td>
                    <td className="num">{c.sync_freq_minutes}m</td>
                    <td className="num">{fmtNum(c.rows_24h)}</td>
                    <td className="num">{c.lag_seconds}s</td>
                    <td className="text-xs text-[var(--ink-muted)]">{c.notes}</td>
                    <td>
                      <a
                        href={`${FIVETRAN_BASE}/${c.fivetran_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-[var(--crimson-dark)] hover:underline whitespace-nowrap"
                      >
                        Open →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {simulateFailure && (
        <section className="surface p-5 mb-8 border-l-4" style={{ borderLeftColor: 'var(--red)' }}>
          <div className="eyebrow mb-2" style={{ color: 'var(--red)' }}>Failure scenario</div>
          <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Retail Link feed marked failed</h3>
          <p className="text-sm text-[var(--ink-muted)] mt-2 leading-relaxed">
            POS for Cardinal's largest retailer stopped flowing. Because the data lake is in Cardinal's S3 with full
            Iceberg snapshot history, dbt continues to build silver and gold from the last successful bronze snapshot.
            Planners see a freshness banner; the demand-sensing agent down-weights signals from the stale source until
            Fivetran self-heals and the next snapshot lands. Nothing crashes. Nothing is lost.
          </p>
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <li className="border border-[var(--hairline)] rounded-sm p-3">
              <div className="font-semibold text-[var(--ink-strong)]">1. Detection</div>
              <div className="text-[var(--ink-muted)] mt-1">Fivetran alert at lag {'>'} 4× sync interval</div>
            </li>
            <li className="border border-[var(--hairline)] rounded-sm p-3">
              <div className="font-semibold text-[var(--ink-strong)]">2. Containment</div>
              <div className="text-[var(--ink-muted)] mt-1">dbt freshness tests freeze downstream models for that source</div>
            </li>
            <li className="border border-[var(--hairline)] rounded-sm p-3">
              <div className="font-semibold text-[var(--ink-strong)]">3. Recovery</div>
              <div className="text-[var(--ink-muted)] mt-1">Connector resumes, missed rows back-fill into the same Iceberg table</div>
            </li>
          </ul>
        </section>
      )}

      <section className="surface p-5">
        <div className="eyebrow mb-2">Recent events</div>
        <h3 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">Self-healing connector log</h3>
        <ul className="space-y-3">
          {data?.failures.map((f) => (
            <li key={f.id} className="border-l-2 border-[var(--crimson)] pl-3">
              <div className="text-sm font-semibold text-[var(--ink-strong)]">{f.title}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-1">
                Detected {new Date(f.detected_at).toLocaleString()}, resolved {new Date(f.resolved_at).toLocaleString()}
              </div>
              <div className="text-xs text-[var(--ink)] mt-1 leading-relaxed">{f.resolution}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--crimson-dark)] mt-1">Lineage: {f.lineage_label}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Open in Fivetran CTA */}
      <section className="surface p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Fivetran Dashboard</div>
          <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Inspect connectors live</div>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">
            View sync history, schema changes, re-sync controls, and column-level observability in Fivetran.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={FIVETRAN_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fivetran text-sm py-2.5 px-5"
          >
            <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 7h10M7 2l5 5-5 5" />
            </svg>
            Open in Fivetran
          </a>
        </div>
      </section>

      {/* dbt-wizard callout */}
      <section className="surface p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderLeft: '4px solid var(--teal)' }}>
        <div>
          <div className="eyebrow mb-1" style={{ color: 'var(--teal)' }}>dbt-wizard</div>
          <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Missing gold models authored on demand</div>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5 max-w-2xl">
            When a planning question has no gold model to answer it — like the Mid-Atlantic BTS promo lift miss —
            dbt-wizard's four sub-agents author, test, and materialize one in under 90 seconds against the same Iceberg lake.
            No backlog. Root cause in hand for the CSCO standup.
          </p>
        </div>
        <Link
          to="/wizard"
          className="btn-fivetran text-sm py-2.5 px-5 shrink-0"
          style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 7h10M7 2l5 5-5 5" />
          </svg>
          Open the scenario
        </Link>
      </section>
    </div>
  );
}
