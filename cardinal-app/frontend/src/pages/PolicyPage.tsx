import PageHeader from '../components/PageHeader';

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Policy brief"
        title="Why CPG supply-chain data is fragmented, and what ODI does about it"
        subtitle="A short brief for the CSCO, the VP of Demand Planning, and the CFO who keeps asking why one chart from two systems shows two different numbers."
      />

      <section className="surface p-6 mb-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">The fragmentation problem</h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          A Fortune-200 CPG manufacturer runs SAP S/4HANA for orders and production, Manhattan WMS for warehouse positions,
          Oracle TMS for freight, Salesforce for retailer accounts and the promotion calendar, retailer portals like
          Walmart Retail Link and Amazon Vendor Central for POS, syndicated panel data from Nielsen, IRI, and Circana for
          category share, a CME-style commodity feed for input costs, and a sustainability data warehouse for emissions
          and EPR. Each system has its own keys, its own time grain, and its own truth.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-3">
          Layered on top: somewhere between 200 and 2,000 Excel workbooks running the S&OP process, the trade-promotion
          P&L, the commodity hedging memo, the EPR PCR-content tracker, and the weekly shipment exception report. The
          single source of truth lives on a planner's hard drive.
        </p>
      </section>

      <section className="surface p-6 mb-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">The cost of fragmentation</h2>
        <ul className="space-y-3 text-sm text-[var(--ink-muted)] leading-relaxed">
          <li><span className="font-semibold text-[var(--ink-strong)]">Forecast accuracy stuck at 18 to 22% MAPE.</span> The statistical engine reads SAP shipments but not retailer POS, syndicated panel, or weather. The planner sees the gap and patches by hand.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">Retailer chargebacks growing 20%+ per year.</span> By the time the planner sees a late shipment in SAP, OTM has known for 36 hours and the carrier has rebooked the asset.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">Trade promotion ROI invisible until after the promo ends.</span> POS and shipment incrementality are calculated weeks later by a brand analyst joining two CSV exports.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">Commodity hedges and procurement decisions decoupled from production plan.</span> The hedger sees the futures curve; the planner sees the order book; nobody sees both.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">EPR compliance reporting takes weeks of manual work.</span> Packaging master, PCR percentage, and state-by-state filing rules live in three different systems.</li>
        </ul>
      </section>

      <section className="surface p-6 mb-6" style={{ borderColor: 'var(--crimson)' }}>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">What ODI does</h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
          Open Data Infrastructure inverts the architecture. Storage is customer-owned Apache Iceberg on S3. Fivetran lands
          every source on the same physical lake. dbt builds the conformed silver and the governed gold, including the
          incrementality table for trade promotion, the forecast-accuracy table for demand planning, the chargeback table
          for retailer compliance, and the Scope 3 intensity table for ESG.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
          Then any compute engine reads those tables. Snowflake for BI, Athena for ad-hoc, Trino for the demand-sensing
          model, DuckDB at the planner's desk. The retailer-compliance agent, the production-scheduling agent, the
          trade-spend agent, and the demand-sensing agent all read the same gold tables the planner reads.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          The planner and the agent are looking at the same row in the same Iceberg table at the same timestamp. The
          number on the screen and the number the agent uses to make a recommendation are the same number.
        </p>
      </section>

      <section className="surface p-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">What gets unlocked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Forecast MAPE moves from 18 to ~12%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when POS, panel, weather, and promotion calendar reach the model on the same day they reach the planner.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Chargebacks cut 30 to 50%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when at-risk shipments are flagged 36 to 72 hours before pickup instead of explained 2 weeks after.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Trade ROI lifts 15 to 25%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when underperforming promotions are cut mid-flight and funds redirected to performing ones.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">EPR filings on autopilot</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when packaging master, PCR content, and state-by-state rule logic live in one governed gold table.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
