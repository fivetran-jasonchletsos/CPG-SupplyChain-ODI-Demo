// Cardinal Provisions — Open Data Infrastructure architecture page.
//
// Ported from Clarity / Verity: same medallion + multi-engine surface.
// CPG flavour: SAP ECC orders + Manhattan WMS + Retailer POS + Nielsen
// consumption. Snowflake is the primary engine; Athena, DuckDB, Trino,
// and Spark stay listed as the same open-lake reads.

import { useEffect, useState } from 'react';
import { api } from '../api/queries';
import type { IcebergData } from '../types';
import PageHeader from '../components/PageHeader';
import { AliveMedallion, type SourceNode, type EngineNode } from '../components/AliveMedallion';

const CPG_SOURCES: SourceNode[] = [
  { id: 'sap',     label: 'SAP ECC Orders',         sub: 'SQL Server log-CDC',     logo: 'sqlserver', freshness: '41s lag',  status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/nor_acidity' },
  { id: 'wms',     label: 'Manhattan WMS',          sub: 'Oracle Binary Log Reader', logo: 'oracle',    freshness: '2 min lag', status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/restrain_doomed' },
  { id: 'pos',     label: 'Retailer POS Feed',      sub: 'Daily syndicated stream', logo: 'hl7',       freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'nielsen', label: 'Nielsen Consumption',    sub: 'Weekly market data',      logo: 'cms',       freshness: '5d lag',    status: 'healthy' },
];

const CPG_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true, logo: 'snowflake' },
  { name: 'Athena',                  logo: 'athena' },
  { name: 'DuckDB',                  logo: 'duckdb' },
  { name: 'Trino',                   logo: 'trino' },
  { name: 'Spark',                   logo: 'spark' },
];

// ─── Types (local) ──────────────────────────────────────────────────────────

interface QueryEngine {
  name: 'Snowflake' | 'Athena' | 'DuckDB' | 'Trino' | 'Spark';
  status: 'active' | 'available' | 'demo';
  description: string;
  sample_query: string;
}

const ENGINES: QueryEngine[] = [
  {
    name: 'Snowflake',
    status: 'active',
    description: 'Primary engine for the Cardinal gold layer. Reads Iceberg externals through Polaris catalog; auto-suspends between queries. Where the planner workbench and the dbt-wizard run-time agents land. Humans and agents read the same gold layer.',
    sample_query: `SELECT
  r.retailer_name, s.sku_id, s.brand,
  k.otif_pct_30d, k.chargebacks_usd_30d,
  d.forecast_accuracy_pct
FROM gold.dim_retailers          r
JOIN gold.fct_pos_weekly         p  USING (retailer_id)
JOIN gold.kpi_otif_daily         k  USING (retailer_id, sku_id)
JOIN gold.kpi_forecast_accuracy_weekly d USING (sku_id)
WHERE k.otif_pct_30d < 0.95
ORDER BY k.chargebacks_usd_30d DESC
LIMIT 50;`,
  },
  {
    name: 'Athena',
    status: 'available',
    description: 'Serverless reads against the same Iceberg gold tables via Glue. Useful for finance/audit ad-hoc that does not need warehouse compute.',
    sample_query: `SELECT retailer_name,
       SUM(chargebacks_usd) AS chargebacks_qtd
FROM gold.kpi_chargebacks_by_retailer
WHERE chargeback_date >= date_trunc('quarter', current_date)
GROUP BY retailer_name
ORDER BY chargebacks_qtd DESC;`,
  },
  {
    name: 'DuckDB',
    status: 'available',
    description: 'Planner laptop. Same Iceberg tables, queried directly from S3 with the iceberg extension. Tiny ad-hoc joins without spinning up Snowflake.',
    sample_query: `INSTALL iceberg;
LOAD iceberg;

SELECT *
FROM iceberg_scan('s3://cardinal-odi-lake/gold/kpi_otif_daily/')
WHERE otif_pct_30d < 0.92
LIMIT 100;`,
  },
  {
    name: 'Trino',
    status: 'available',
    description: 'Federated engine that joins the lake to other relational sources (carrier portals, broker CRMs) without copying data first.',
    sample_query: `SELECT s.brand, AVG(p.units_sold) AS avg_units
FROM iceberg.gold.fct_pos_weekly p
JOIN postgres.broker.account_master a
  ON a.retailer_id = p.retailer_id
WHERE p.week_start >= current_date - interval '12' week
GROUP BY s.brand;`,
  },
  {
    name: 'Spark',
    status: 'available',
    description: 'Distributed compute for demand-forecast model training and large cohort joins. Reads the same Iceberg tables via the spark-iceberg runtime.',
    sample_query: `df = spark.read.format("iceberg")\\
  .load("gold.fct_pos_weekly")
df.groupBy("brand", "retailer_id")\\
  .agg({"units_sold": "sum"})\\
  .show()`,
  },
];

const ENGINE_COLORS: Record<QueryEngine['name'], string> = {
  Snowflake: '#29b5e8',
  Athena:    '#ff9900',
  DuckDB:    '#2c2c2c',
  Trino:     '#dd00a1',
  Spark:     '#e25a1c',
};

// ─── dbt layers + sources copy (kept from prior Cardinal page) ──────────────

const STAGES = [
  { layer: 'bronze', title: 'Bronze', detail: 'Raw landings, source schemas preserved, partitioned by ingest_date and source key. Schema evolution promoted automatically.' },
  { layer: 'silver', title: 'Silver', detail: 'Conformed facts and dimensions: fact_shipment, fact_inventory_daily, fact_pos_weekly, dim_sku, dim_retailer, dim_plant. Late-arriving and slowly changing dims handled by dbt snapshots.' },
  { layer: 'gold',   title: 'Gold',   detail: 'Governed KPIs: kpi_otif_daily, kpi_forecast_accuracy_weekly, kpi_plant_utilization, kpi_chargebacks_by_retailer, kpi_trade_promotion_roi, kpi_scope3_intensity_monthly.' },
  { layer: 'marts',  title: 'Marts',  detail: 'Persona-shaped marts: planner_workbench, csco_summary, trade_marketing_console, esg_disclosure. The agents read here.' },
];

const SOURCES = [
  { name: 'SAP S/4HANA (ERP)',          provides: 'Sales orders, production orders, deliveries, material master, BOMs' },
  { name: 'Manhattan Associates WMS',   provides: 'Warehouse inventory positions, dock-to-stock, pick confirms, putaway' },
  { name: 'Oracle Transportation Mgmt', provides: 'Carrier tenders, accepted shipments, in-transit telemetry, freight cost' },
  { name: 'Salesforce',                 provides: 'Retailer accounts, contracts, promotion calendar, broker hierarchy' },
  { name: 'Walmart Retail Link',        provides: 'Store-SKU POS hourly, MABD compliance, SQEP chargebacks, OOS indicators' },
  { name: 'Amazon Vendor Central',      provides: 'Sales diagnostics, ASN 856 status, inventory health, chargeback feed' },
  { name: 'Target Partners Online',     provides: 'Bullseye Vendor Scorecard, store-SKU POS, chargeback feed' },
  { name: 'Kroger Vendor Portal',       provides: 'Store-SKU POS, Compliance Grid, JBP attainment extract' },
  { name: 'Syndicated panel (Nielsen, IRI, Circana style)', provides: 'Weekly category-level scan, ACV, distribution, share' },
  { name: 'Carrier portals (10 carriers)', provides: 'Tender acceptance, in-transit GPS, POD, OTD by lane' },
  { name: 'Sustainability data warehouse', provides: 'Scope 1, 2, 3 emissions, water, packaging, EPR filings' },
];

// =============================================================================
// Page
// =============================================================================

export default function ArchitecturePage() {
  const [iceberg, setIceberg] = useState<IcebergData | null>(null);
  const [activeEngine, setActiveEngine] = useState<QueryEngine>(ENGINES[0]);

  useEffect(() => { api.getIceberg().then(setIceberg).catch(() => {}); }, []);

  // Derive medallion layer stats from the live Iceberg inventory.
  const byLayer = (l: string) => (iceberg?.tables ?? []).filter((t) => t.layer === l);
  const layerStats = (l: string) => {
    const t = byLayer(l);
    return {
      tables: t.length || 1,
      rows: t.reduce((s, r) => s + (r.rows ?? 0), 0),
      bytes: t.reduce((s, r) => s + (r.size_gb ?? 0) * 1_000_000_000, 0),
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="ODI Reference Architecture"
        title="Snowflake + Iceberg, fed by Fivetran"
        subtitle="Eleven sources across ERP, WMS, TMS, CRM, four retailer portals, syndicated panel, carrier feeds, and sustainability — landing in one customer-owned Iceberg lake on S3. dbt builds gold and marts; five compute engines point at the same files. Cardinal owns the storage. The compute layer is pluggable."
      />

      {/* ── Lake bucket banner ─────────────────────────────────────────── */}
      <section className="surface p-6 mb-8">
        <div className="eyebrow mb-1">Lake bucket</div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="font-serif text-2xl font-semibold text-[var(--ink-strong)] num">{iceberg?.lake_bucket ?? 'cardinal-odi-lake'}</div>
          <div className="text-sm text-[var(--ink-muted)]">{iceberg?.format ?? 'Apache Iceberg v2, Parquet, ZSTD'}</div>
          <div className="text-sm text-[var(--ink-muted)]">{iceberg?.catalog ?? 'AWS Glue Data Catalog'}</div>
        </div>
      </section>

      {/* ── Data Flow diagram (AliveMedallion) ─────────────────────────── */}
      <section className="surface p-6 sm:p-8 mb-10">
        <div className="eyebrow mb-1">Data Flow</div>
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] mb-2">
          Source &rarr; Fivetran &rarr; Iceberg (MDLS) &rarr; Snowflake / Athena / Trino &rarr; dbt Labs &rarr; React
        </h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-6 max-w-4xl">
          Fivetran lands every CDC row into Iceberg (MDLS) on S3 in open Apache Iceberg format &mdash; one copy of
          the bytes. Snowflake, Athena, and Trino read the same Iceberg bytes via external catalogs, no copies and
          no extracts. Fivetran Transformations triggers dbt Labs the moment the source sync finishes, and bronze
          &rarr; silver &rarr; gold stays in Iceberg the whole way.
        </p>

        <AliveMedallion
          sources={CPG_SOURCES}
          bronze={layerStats('bronze')}
          silver={layerStats('silver')}
          gold={layerStats('gold')}
          engines={CPG_ENGINES}
          accent="#b1182b"
        />
      </section>

      {/* ── Sources detail ─────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="surface p-4">
              <div className="flex items-start gap-3">
                <span className="layer-chip bronze shrink-0">Source</span>
                <div className="min-w-0">
                  <div className="font-serif font-semibold text-[var(--ink-strong)]">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-1">Provides: {s.provides}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── dbt layers ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">dbt layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STAGES.map((s) => (
            <div key={s.layer} className="surface p-5">
              <div className="eyebrow mb-2">{s.title}</div>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Multi-engine showcase ──────────────────────────────────────── */}
      <section className="surface overflow-hidden mb-10">
        <header className="p-5 border-b border-[var(--hairline-soft)]">
          <div className="eyebrow">Compute is a choice</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            Same Iceberg tables. Five engines. One query at a time.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Pick a query engine — the SQL barely changes, but the operational, cost, and
            governance profile shifts. That choice belongs to Cardinal, not the vendor.
          </p>
        </header>

        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {ENGINES.map((e) => (
            <button
              key={e.name}
              onClick={() => setActiveEngine(e)}
              className="px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider border transition-all"
              style={
                activeEngine.name === e.name
                  ? { background: ENGINE_COLORS[e.name], borderColor: ENGINE_COLORS[e.name], color: '#ffffff' }
                  : { background: '#ffffff', color: 'var(--ink-muted)', borderColor: 'var(--hairline)' }
              }
            >
              {e.name}
              {e.status === 'active' && <span className="ml-1.5 text-[9px] opacity-80">● ACTIVE</span>}
            </button>
          ))}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-2">Query</div>
            <pre className="rounded-sm p-4 text-[11.5px] leading-relaxed overflow-x-auto font-mono" style={{ background: '#2c2c2c', color: '#fefaf3' }}>
              <code>{activeEngine.sample_query}</code>
            </pre>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-2">Why this engine</div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{activeEngine.description}</p>
            <div className="mt-4 pt-4 border-t border-[var(--hairline-soft)]">
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-1">Status</div>
              <div className="text-sm font-semibold" style={{ color: activeEngine.status === 'active' ? '#16a34a' : '#6b7280' }}>
                {activeEngine.status === 'active' ? '● Primary engine — powers this site' : 'Compatible and ready to wire in'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Iceberg table inventory (kept; existing API contract) ──────── */}
      <section className="surface p-6">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] mb-3">Iceberg table inventory</h2>
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Layer</th>
                <th>Table</th>
                <th className="num">Rows</th>
                <th className="num">Size GB</th>
                <th>Partitioning</th>
                <th>Last snapshot</th>
              </tr>
            </thead>
            <tbody>
              {iceberg?.tables.map((t) => (
                <tr key={t.name}>
                  <td><span className={`layer-chip ${t.layer}`}>{t.layer}</span></td>
                  <td className="num">{t.name}</td>
                  <td className="num">{t.rows.toLocaleString()}</td>
                  <td className="num">{t.size_gb.toLocaleString()}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{t.partitions ?? '—'}</td>
                  <td className="text-xs text-[var(--ink-muted)]">{new Date(t.last_snapshot).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
