import { useEffect, useState } from 'react';
import { api, fmtNum } from '../api/queries';
import type { PipelineData } from '../types';
import PageHeader from '../components/PageHeader';

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => { api.getPipeline().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Data Pipeline"
        title="Nine Fivetran connectors, four dbt layers, one lineage label"
        subtitle="Every row in the lake has Fivetran as its source-of-truth ingestion lineage. Schema evolution, token rotation, and rate-limit handling are connector responsibilities, not dbt responsibilities."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {data?.layers.map((l) => (
          <div key={l.layer} className="surface p-4">
            <div className={`layer-chip ${l.layer === 'gold' ? 'gold' : l.layer === 'silver' ? 'silver' : l.layer === 'bronze' ? 'bronze' : 'crimson'} inline-flex mb-2`}>{l.layer}</div>
            <div className="num text-2xl font-semibold text-[var(--ink-strong)]">{l.table_count}</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">tables, {l.row_count_billions.toFixed(1)}B rows, {l.size_tb.toFixed(1)} TB</div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-1">freshness {l.freshness_minutes} min</div>
          </div>
        ))}
      </section>

      <section className="surface mb-8">
        <div className="surface-head flex items-center justify-between">
          <div>
            <div className="eyebrow">Connectors</div>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">All flowing through Fivetran</h2>
          </div>
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
        <div className="p-4 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Category</th>
                <th>Status</th>
                <th className="num">Sync freq</th>
                <th className="num">Rows 24h</th>
                <th className="num">Lag</th>
                <th>Lineage label</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data?.connectors.map((c) => {
                const isRetailLink = c.id === 'walmart_retail_link';
                const status = simulateFailure && isRetailLink ? 'failed' : c.status;
                return (
                  <tr key={c.id}>
                    <td className="font-semibold text-[var(--ink-strong)]">{c.name}</td>
                    <td>{c.category}</td>
                    <td>
                      <span className={`pill ${status === 'healthy' ? 'good' : status === 'degraded' ? 'warn' : 'bad'}`}>{status}</span>
                    </td>
                    <td className="num">{c.sync_freq_minutes}m</td>
                    <td className="num">{fmtNum(c.rows_24h)}</td>
                    <td className="num">{c.lag_seconds}s</td>
                    <td><span className="layer-chip crimson">{c.lineage_label}</span></td>
                    <td className="text-xs text-[var(--ink-muted)]">{c.notes}</td>
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
    </div>
  );
}
