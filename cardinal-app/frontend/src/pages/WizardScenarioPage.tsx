/*
 * WizardScenarioPage — Scenario framing page for the dbt-wizard demo.
 *
 * Route: /wizard
 *
 * Shows the VP Demand Planning question, a T-minus countdown to the CSCO
 * standup, 4-tile KPI grid, upstream-model panel, state-of-world detail,
 * 6-step build path, and a CTA to launch the Live Build.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityScenarioPage.tsx — CPG-flavored.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wizardDataUrl } from '../components/wizardTypes';
import React from 'react';

interface UpstreamModel {
  model: string;
  layer: string;
  grain: string;
  description: string;
}

interface ScenarioData {
  company: string;
  request_id: string;
  requested_by: string;
  timezone_label: string;
  question: string;
  metric_label: string;
  metric_code: string;
  sop_meeting_label: string;
  region_focus: string;
  category: string;
  target_schema: string;
  target_model: string;
  target_grain: string;
  prior_crisis_id: string;
  upstream_models: UpstreamModel[];
  manual_time_days: string;
  build_room_seconds: number;
}

function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `T-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function WizardScenarioPage() {
  const [s, setS] = useState<ScenarioData | null>(null);
  const [tMinus, setTMinus] = useState('T-10:00:00');

  useEffect(() => {
    fetch(wizardDataUrl('wizard_scenario.json'))
      .then(r => { if (!r.ok) throw new Error(`Failed to fetch scenario: ${r.status}`); return r.json(); })
      .then(setS)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let remaining = 10 * 3600; // 10-hour countdown to CSCO standup
    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setTMinus(formatCountdown(remaining));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!s) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 num text-sm" style={{ color: 'var(--ink-muted)' }}>
        Loading scenario...
      </div>
    );
  }

  const LAYER_COLOR: Record<string, string> = {
    staging:       'var(--teal)',
    intermediate:  '#b45309',
    gold:          'var(--forest)',
    gap:           'var(--red)',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="pill bad" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}>
            Gap — Active
          </span>
          <span className="eyebrow">{s.request_id}</span>
          <span className="eyebrow">Follows {s.prior_crisis_id}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight" style={{ color: 'var(--ink-strong)' }}>
          {s.timezone_label}.{' '}
          <span style={{ color: 'var(--crimson)' }}>{s.requested_by}.</span>
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-lg" style={{ color: 'var(--ink-muted)' }}>
          No <span className="num text-sm">gold.fct_lift_by_sku_promo_region_week</span> exists.
          The {s.category} BTS promo execution gap is unresolved across {s.region_focus}.
          CSCO standup in 10 hours. Manual build ETA: {s.manual_time_days}.
          dbt-wizard ETA: {s.build_room_seconds} seconds.
          Trade spend at risk: <strong style={{ color: 'var(--crimson)' }}>$1.6M this cycle</strong>.
        </p>

        {/* VP question highlight */}
        <div
          className="mt-5 rounded-lg border p-5"
          style={{ borderLeft: '4px solid var(--crimson)', borderColor: 'var(--hairline)', borderLeftColor: 'var(--crimson)', background: 'rgba(177,24,43,0.04)' }}
        >
          <div className="eyebrow mb-2">The VP Demand Planning question</div>
          <p className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink-strong)' }}>
            "{s.question}"
          </p>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <KpiTile
          label="CSCO Standup"
          value={tMinus}
          unit={s.sop_meeting_label}
          tone="var(--crimson)"
        />
        <KpiTile
          label="Metric requested"
          value="NEW"
          unit={s.metric_label}
          tone="var(--amber)"
        />
        <KpiTile
          label="Manual ETA"
          value={s.manual_time_days}
          unit="data engineering"
          tone="var(--teal)"
        />
        <KpiTile
          label="dbt-wizard ETA"
          value={`${s.build_room_seconds}s`}
          unit="four sub-agents"
          tone="var(--forest)"
        />
      </div>

      {/* Upstream models + state of world */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <div className="lg:col-span-2 surface p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="eyebrow">Upstream models available</div>
              <div className="font-serif text-xl font-semibold mt-1" style={{ color: 'var(--ink-strong)' }}>
                Four signals. Already in the lake.
              </div>
            </div>
            <span className="pill good" style={{ fontSize: 11 }}>
              4 of 4
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {s.upstream_models.map(u => (
              <div
                key={u.model}
                className="rounded-md border p-4 relative"
                style={{ borderColor: 'var(--hairline)', background: 'var(--cream)' }}
              >
                <div
                  className="absolute top-0 left-0 h-full w-1 rounded-l-md"
                  style={{ background: LAYER_COLOR[u.layer] ?? 'var(--teal)' }}
                />
                <div className="num text-xs pl-1" style={{ color: LAYER_COLOR[u.layer] ?? 'var(--teal)' }}>
                  {u.layer}
                </div>
                <div className="num text-sm font-semibold mt-1 pl-1" style={{ color: 'var(--ink-strong)' }}>{u.model}</div>
                <div className="num text-[11px] mt-1 pl-1" style={{ color: 'var(--ink-muted)' }}>grain — {u.grain}</div>
                <p className="text-xs mt-2 pl-1 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{u.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5">
          <div className="eyebrow mb-3">State of the world</div>
          <dl className="space-y-3 text-sm">
            <Row k="Question requested by" v={s.requested_by} />
            <Row k="Requested at" v={<span className="num">{s.timezone_label}</span>} />
            <Row k="Company" v={s.company} />
            <Row k="Category" v={s.category} />
            <Row k="Region focus" v={s.region_focus} />
            <Row k="Target schema" v={<span className="num">{s.target_schema}</span>} />
            <Row k="Target model" v={<span className="num text-xs">{s.target_model}</span>} />
            <Row k="Target grain" v={<span className="num text-xs">{s.target_grain}</span>} />
            <Row k="Lookback window" v={<span className="num">BTS promo + 6 weeks</span>} />
            <Row k="Prior incident" v={<span className="num">{s.prior_crisis_id}</span>} />
            <Row
              k="Standup next"
              v={
                <span className="num" style={{ color: 'var(--crimson)' }}>
                  {s.sop_meeting_label}
                </span>
              }
            />
          </dl>
        </div>
      </div>

      {/* 6-step build path */}
      <div
        className="surface p-5 mb-8"
        style={{ borderLeft: '4px solid var(--teal)' }}
      >
        <div className="eyebrow mb-2" style={{ color: 'var(--teal)' }}>The path through six steps</div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="num text-xs shrink-0 mt-0.5" style={{ color: step.color }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-semibold" style={{ color: 'var(--ink-strong)' }}>{step.title}</div>
                <div className="text-xs num" style={{ color: 'var(--ink-muted)' }}>
                  {step.who} — {step.tools}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between surface p-5">
        <div>
          <div className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink-strong)' }}>
            Ready to open the Live Build?
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Four sub-agents will be paged. The new model gets written character-by-character on screen.
          </div>
        </div>
        <Link
          to="/wizard-live"
          state={{ question: s.question }}
          className="inline-flex items-center gap-2 rounded-sm text-white font-semibold px-6 py-4 whitespace-nowrap hover:opacity-95 transition-opacity"
          style={{ background: 'var(--crimson)' }}
        >
          Open the Live Build
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const STEPS = [
  { title: 'Discovery',             who: 'Explorer',     tools: 'status, search',        color: 'var(--teal)' },
  { title: 'Schema Understanding',  who: 'Summary',      tools: 'describe, lineage',     color: '#7c3aed' },
  { title: 'Data Inspection',       who: 'Worker',       tools: 'warehouse, dbt_show',   color: '#be185d' },
  { title: 'Model Creation',        who: 'Worker',       tools: 'file edits, model gen', color: '#be185d' },
  { title: 'Test Authoring',        who: 'Verification', tools: 'describe, dbt_show',    color: 'var(--forest)' },
  { title: 'Materialization',       who: 'Worker + Ver', tools: 'dbt_run, lineage',      color: 'var(--forest)' },
];

function KpiTile({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div
      className="surface p-5 relative overflow-hidden"
      style={{ borderLeft: `4px solid ${tone}` }}
    >
      <div className="eyebrow mb-2">{label}</div>
      <div
        className="font-serif text-3xl font-semibold tracking-tight tabular"
        style={{ color: tone }}
      >
        {value}
      </div>
      <div className="text-xs mt-2 num" style={{ color: 'var(--ink-soft)' }}>{unit}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="num text-xs" style={{ color: 'var(--ink-muted)' }}>{k}</dt>
      <dd className="text-right" style={{ color: 'var(--ink-strong)' }}>{v}</dd>
    </div>
  );
}
