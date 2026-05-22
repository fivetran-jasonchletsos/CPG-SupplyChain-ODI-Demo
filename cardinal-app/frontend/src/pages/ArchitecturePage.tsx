import { useEffect, useState } from 'react';
import { api } from '../api/queries';
import type { IcebergData } from '../types';
import PageHeader from '../components/PageHeader';

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

const STAGES = [
  { layer: 'bronze', title: 'Bronze', detail: 'Raw landings, source schemas preserved, partitioned by ingest_date and source key. Schema evolution promoted automatically.' },
  { layer: 'silver', title: 'Silver', detail: 'Conformed facts and dimensions: fact_shipment, fact_inventory_daily, fact_pos_weekly, dim_sku, dim_retailer, dim_plant. Late-arriving and slowly changing dims handled by dbt snapshots.' },
  { layer: 'gold',   title: 'Gold',   detail: 'Governed KPIs: kpi_otif_daily, kpi_forecast_accuracy_weekly, kpi_plant_utilization, kpi_chargebacks_by_retailer, kpi_trade_promotion_roi, kpi_scope3_intensity_monthly.' },
  { layer: 'marts',  title: 'Marts',  detail: 'Persona-shaped marts: planner_workbench, csco_summary, trade_marketing_console, esg_disclosure. The agents read here.' },
];

export default function ArchitecturePage() {
  const [iceberg, setIceberg] = useState<IcebergData | null>(null);

  useEffect(() => { api.getIceberg().then(setIceberg).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="ODI Reference Architecture"
        title="Snowflake + Iceberg, fed by Fivetran"
        subtitle="Eleven sources spanning ERP, WMS, TMS, CRM, four retailer portals, syndicated panel, carrier feeds, and sustainability — landing in one customer-owned Iceberg lake on S3. dbt builds gold and marts; four compute engines point at the same files. Cardinal owns the storage. The compute layer is pluggable."
      />

      <section className="surface p-6 mb-8">
        <div className="eyebrow mb-1">Lake bucket</div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="font-serif text-2xl font-semibold text-[var(--ink-strong)] num">{iceberg?.lake_bucket ?? 'cardinal-odi-lake'}</div>
          <div className="text-sm text-[var(--ink-muted)]">{iceberg?.format ?? 'Apache Iceberg v2, Parquet, ZSTD'}</div>
          <div className="text-sm text-[var(--ink-muted)]">{iceberg?.catalog ?? 'AWS Glue Data Catalog'}</div>
        </div>
      </section>

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

      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Compute engines on the same files</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {(iceberg?.compute_engines ?? []).map((e) => (
            <div key={e.name} className="surface p-4">
              <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{e.name}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">{e.role}</div>
            </div>
          ))}
        </div>
      </section>

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
