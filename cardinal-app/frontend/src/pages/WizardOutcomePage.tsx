/*
 * WizardOutcomePage — Post-build outcome page for the dbt-wizard demo.
 *
 * Route: /wizard-outcome
 *
 * Shows: materialized model card, test pass summary, root-cause panel,
 * before/after lineage, without/with wizard columns, governance posture,
 * and CTAs to replay or return home.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityOutcomePage.tsx — CPG-flavored.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wizardDataUrl } from '../components/wizardTypes';

interface LineageNode {
  id: string;
  name: string;
  layer: string;
  built?: boolean;
  new?: boolean;
}

interface LineageEdge {
  from: string;
  to: string;
}

interface Metric {
  label: string;
  value: string;
}

interface Column {
  label: string;
  summary: string;
  metrics: Metric[];
  narrative: string[];
}

interface GovernanceItem {
  label: string;
  value: string;
}

interface RootCause {
  headline: string;
  detail: string;
  affected_cohort: string;
  fallout_count: number;
  total_reviewed: number;
}

interface OutcomeData {
  materialized_model: string;
  row_count: number;
  tests_passed: number;
  tests_written: string;
  build_seconds: number;
  before: { nodes: LineageNode[]; edges: LineageEdge[] };
  after:  { nodes: LineageNode[]; edges: LineageEdge[] };
  root_cause: RootCause;
  without_wizard: Column;
  with_wizard:    Column;
  governance: GovernanceItem[];
  hero: { label: string; value: string; note: string };
}

const NODE_COLOR: Record<string, string> = {
  staging:      '#0073EA',
  intermediate: '#b45309',
  'marts/dim':  '#7c3aed',
  gold:         '#0d6e6e',
  gap:          '#dc2626',
  consumer:     '#be185d',
};

export default function WizardOutcomePage() {
  const [o, setO] = useState<OutcomeData | null>(null);

  useEffect(() => {
    fetch(wizardDataUrl('wizard_outcome.json'))
      .then(r => r.json())
      .then(setO);
  }, []);

  if (!o) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 num text-sm" style={{ color: 'var(--ink-muted)' }}>
        Loading outcome...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="pill good"
            style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}
          >
            Build — Materialized
          </span>
          <span className="eyebrow">Lineage updated</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight" style={{ color: 'var(--ink-strong)' }}>
          Before and after, on the same lake.
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-lg" style={{ color: 'var(--ink-muted)' }}>
          The gap on the left. The asset on the right. The delta is what dbt-wizard built in{' '}
          {o.build_seconds} seconds — the same window Sarah Osei waited for an answer.
        </p>
      </header>

      {/* Root-cause panel */}
      <section
        className="surface p-6 mb-10"
        style={{ borderLeft: '5px solid var(--crimson)', background: 'rgba(177,24,43,0.04)' }}
      >
        <div className="eyebrow mb-2">Root cause identified</div>
        <p className="font-serif text-xl sm:text-2xl font-semibold leading-tight mb-3" style={{ color: 'var(--ink-strong)' }}>
          {o.root_cause.headline}
        </p>
        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-muted)' }}>{o.root_cause.detail}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="eyebrow mb-1">Affected cohort</div>
            <div className="num text-sm font-semibold" style={{ color: 'var(--ink-strong)' }}>
              {o.root_cause.affected_cohort}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Stores impacted</div>
            <div className="font-serif text-3xl font-semibold" style={{ color: 'var(--crimson)' }}>
              {o.root_cause.fallout_count}
            </div>
            <div className="num text-xs" style={{ color: 'var(--ink-muted)' }}>
              of {o.root_cause.total_reviewed} reviewed
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Execution signature</div>
            <div className="num text-sm font-semibold" style={{ color: 'var(--ink-strong)' }}>
              Endcap +4.1d late — signage +3.8d late — peak BTS window missed
            </div>
          </div>
        </div>
      </section>

      {/* Lineage comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <LineagePanel
          title="Before — the gap"
          subtitle="No gold table tracks lift by SKU, promo, region, and week."
          nodes={o.before.nodes}
          edges={o.before.edges}
          tone="crisis"
        />
        <LineagePanel
          title="After — the asset"
          subtitle="Materialized to Iceberg. Downstream consumers attached."
          nodes={o.after.nodes}
          edges={o.after.edges}
          tone="resolved"
        />
      </section>

      {/* Without vs. with */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <WizardColumn data={o.without_wizard} tone="crisis" />
        <WizardColumn data={o.with_wizard}    tone="resolved" />
      </section>

      {/* Model card + test summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="surface p-5 sm:col-span-2" style={{ borderLeft: '4px solid var(--teal)' }}>
          <div className="eyebrow mb-1">Materialized model</div>
          <div className="num text-base font-semibold mb-1" style={{ color: 'var(--ink-strong)' }}>
            {o.materialized_model}
          </div>
          <div className="num text-xs" style={{ color: 'var(--ink-muted)' }}>
            {o.row_count.toLocaleString()} rows — Iceberg v2 — Parquet — ZSTD
          </div>
        </div>
        <div className="surface p-5" style={{ borderLeft: '4px solid var(--forest)' }}>
          <div className="eyebrow mb-1">Tests</div>
          <div className="font-serif text-3xl font-semibold" style={{ color: 'var(--forest)' }}>
            {o.tests_passed} / {o.tests_passed}
          </div>
          <div className="num text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{o.tests_written}</div>
        </div>
      </section>

      {/* Governance posture */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold mb-4 pb-2 border-b" style={{ borderColor: 'var(--hairline)', color: 'var(--ink-strong)' }}>
          Governance posture on the new asset
        </h2>
        <div className="surface p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {o.governance.map(g => (
              <div key={g.label}>
                <div className="eyebrow mb-1">{g.label}</div>
                <div className="num text-sm font-semibold" style={{ color: 'var(--ink-strong)' }}>{g.value}</div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Hero */}
      <section
        className="surface p-8 mb-10"
        style={{ borderLeft: '5px solid var(--forest)', background: 'rgba(20,83,45,0.04)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-1">
            <div className="eyebrow mb-2">dbt-wizard result</div>
            <div className="font-serif text-6xl sm:text-7xl font-semibold tracking-tight" style={{ color: 'var(--forest)' }}>
              {o.hero.value}
            </div>
            <div className="num text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>question to materialized</div>
          </div>
          <div className="sm:col-span-2">
            <div className="font-serif text-2xl sm:text-3xl font-semibold leading-tight" style={{ color: 'var(--ink-strong)' }}>
              {o.hero.label}
            </div>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{o.hero.note}</p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 surface p-5 items-center justify-between">
        <div>
          <div className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink-strong)' }}>Run it again?</div>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            The pipeline is real. The sub-agents are deterministic.
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm border font-semibold px-5 py-2.5 hover:bg-[var(--cream)] transition-colors"
            style={{ borderColor: 'var(--hairline)', background: 'white', color: 'var(--ink-strong)' }}
          >
            Back to home
          </Link>
          <Link
            to="/wizard-live"
            className="inline-flex items-center gap-2 rounded-sm text-white font-semibold px-5 py-2.5 hover:opacity-95 transition-opacity"
            style={{ background: 'var(--crimson)' }}
          >
            Replay live build
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function WizardColumn({ data, tone }: { data: Column; tone: 'crisis' | 'resolved' }) {
  const toneColor =
    tone === 'crisis' ? 'var(--crimson)' : 'var(--forest)';
  const chipClass =
    tone === 'crisis' ? 'pill bad' : 'pill good';
  return (
    <div
      className="surface p-6"
      style={{ borderLeft: `5px solid ${toneColor}` }}
    >
      <div className={`${chipClass} mb-3 inline-flex`} style={{ fontSize: 11 }}>
        {data.label}
      </div>
      <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--ink-strong)' }}>{data.summary}</h2>

      <dl className="space-y-2 my-5 rounded-md border p-4" style={{ borderColor: 'var(--hairline)', background: 'var(--cream)' }}>
        {data.metrics.map(m => (
          <div key={m.label} className="flex justify-between gap-3 text-sm">
            <dt className="num text-xs" style={{ color: 'var(--ink-muted)' }}>{m.label}</dt>
            <dd className="num font-semibold" style={{ color: toneColor }}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="eyebrow mb-2">Narrative</div>
      <ol className="space-y-2 text-sm">
        {data.narrative.map((n, i) => (
          <li key={n} className="flex gap-2" style={{ color: 'var(--ink-muted)' }}>
            <span className="num text-xs shrink-0 mt-0.5" style={{ color: toneColor }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LineagePanel({
  title,
  subtitle,
  nodes,
  edges,
  tone,
}: {
  title: string;
  subtitle: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  tone: 'crisis' | 'resolved';
}) {
  const accent =
    tone === 'crisis' ? 'var(--crimson)' : 'var(--forest)';
  const chipClass =
    tone === 'crisis' ? 'pill bad' : 'pill good';

  const layers = ['staging', 'intermediate', 'marts/dim', 'gold', 'gap', 'consumer'];
  const grouped: Record<string, LineageNode[]> = {};
  for (const l of layers) grouped[l] = [];
  for (const n of nodes) {
    const key = grouped[n.layer] ? n.layer : 'staging';
    grouped[key].push(n);
  }
  const populated = layers.filter(l => grouped[l].length > 0);

  return (
    <div
      className="surface p-5"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className={`${chipClass} mb-2 inline-flex`} style={{ fontSize: 11 }}>
        {title}
      </div>
      <div className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>{subtitle}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ minHeight: 280 }}>
        {populated.map(layer => (
          <div key={layer}>
            <div
              className="eyebrow mb-2"
              style={{ color: NODE_COLOR[layer] ?? '#0d6e6e' }}
            >
              {layer}
            </div>
            <div className="space-y-1.5">
              {grouped[layer].map(n => {
                const isGap = layer === 'gap';
                const isNew = n.new;
                return (
                  <div
                    key={n.id}
                    className="rounded-md border p-2.5"
                    style={{
                      borderColor: 'var(--hairline)',
                      borderLeftColor: NODE_COLOR[layer] ?? '#0d6e6e',
                      borderLeftWidth: 3,
                      background: isGap
                        ? 'rgba(220,38,38,0.06)'
                        : isNew
                        ? 'rgba(20,83,45,0.06)'
                        : 'var(--cream)',
                      borderStyle: isGap ? 'dashed' : 'solid',
                    }}
                  >
                    <div className="num text-[11px]" style={{ color: NODE_COLOR[layer] ?? '#0d6e6e' }}>
                      {layer}
                    </div>
                    <div className="num text-xs font-semibold mt-0.5" style={{ color: 'var(--ink-strong)' }}>
                      {n.name}
                    </div>
                    {isGap && (
                      <div className="num text-[10px] mt-1" style={{ color: '#dc2626' }}>NOT BUILT</div>
                    )}
                    {isNew && (
                      <div className="num text-[10px] mt-1" style={{ color: 'var(--forest)' }}>
                        BUILT BY dbt-wizard
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 pt-3 border-t flex items-center gap-2 num text-[10px]"
        style={{ borderColor: 'var(--hairline)', color: 'var(--ink-soft)' }}
      >
        <span>{nodes.length} nodes</span>
        <span style={{ color: 'var(--hairline)' }}>—</span>
        <span>{edges.length} edges</span>
      </div>
    </div>
  );
}
