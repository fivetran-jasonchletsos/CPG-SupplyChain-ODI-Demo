import PageHeader from '../components/PageHeader';

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Policy brief"
        title="Why the CPG-to-retail supply chain is fragmented, and what ODI does about it"
        subtitle="A short brief for the CSCO, the VP of Customer Logistics, and the CFO who keeps asking why one chart from SAP and one from Walmart Retail Link show two different numbers for the same week."
      />

      <section className="surface p-6 mb-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">The downstream fragmentation problem</h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          A Fortune-200 CPG manufacturer ships from 11 plants and 18 co-packers, through 9 DCs, to 30 top retail customers
          who account for two-thirds of revenue and the same share of operational pain. Each piece of the journey lives in
          a different system: SAP S/4HANA runs the outbound order, Manhattan WMS runs the warehouse pick, Oracle TMS runs
          the carrier tender, then the freight leaves the dock and the manufacturer loses primary visibility.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-3">
          From that point on, the source of truth is the retailer's portal. Walmart Retail Link for OTIF, MABD compliance,
          and SQEP chargebacks. Amazon Vendor Central for ASN 856 validation, Subscribe-and-Save replenishment, and
          carton-prep chargebacks. Target Partners Online for the Bullseye Vendor Scorecard. Kroger Vendor Portal for the
          Compliance Grid. Costco's compliance schedule lives in PDFs emailed by buyer. Syndicated panel (Nielsen, IRI,
          Circana) shows category share with a two-week lag. The carriers all run their own portals for tender acceptance,
          in-transit telemetry, and POD. Each system has its own keys, its own time grain, and its own truth.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-3">
          Layered on top: somewhere between 500 and 2,000 Excel workbooks running the Joint Business Planning process —
          one workbook per retailer, per category, per Q1 top-to-top. The volume commitment, the distribution commitment,
          the promotion commitment, the trade-funds envelope, and the recovery plan all live on a customer-team lead's
          hard drive.
        </p>
      </section>

      <section className="surface p-6 mb-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">The cost of fragmentation, downstream edition</h2>
        <ul className="space-y-3 text-sm text-[var(--ink-muted)] leading-relaxed">
          <li><span className="font-semibold text-[var(--ink-strong)]">Retailer chargebacks growing 20%+ per year.</span> By the time the customer-team lead sees a late shipment in SAP, OTM has known for 36 hours, the carrier has rebooked the asset, and Walmart's SQEP grid has already calculated the MABD-miss penalty.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">JBP commitments tracked in spreadsheets.</span> The volume number from SAP, the distribution number from syndicated panel, and the promotion number from Salesforce never share a row. Top-to-top meetings open with twenty minutes of "whose number is right?"</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">Phantom OOS invisible until the merchandiser walks the store.</span> POS units collapse on a SKU that still has plenty of on-hand. The signal lives in Retail Link, but it doesn't reach the Cardinal planner until Thursday's exception report.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">Forecast accuracy stuck at 18 to 22% MAPE.</span> The statistical engine reads SAP shipments, not retailer POS, syndicated panel, promotion calendar, weather, or social signal. The customer-team lead sees the gap and patches by hand, retailer by retailer.</li>
          <li><span className="font-semibold text-[var(--ink-strong)]">New-item launches sputter at retailer distribution targets.</span> Doors-distributed and weekly-velocity data live in the retailer's portal; the brand team reconciles by hand at week 8, three weeks too late to fix the rollout.</li>
        </ul>
      </section>

      <section className="surface p-6 mb-6" style={{ borderColor: 'var(--crimson)' }}>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">What ODI does</h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
          Open Data Infrastructure inverts the architecture. Storage is customer-owned Apache Iceberg on S3. Fivetran lands
          every source — SAP, WMS, TMS, Salesforce, Walmart Retail Link, Amazon Vendor Central, Target Partners Online,
          Kroger Vendor Portal, syndicated panel, every carrier portal — on the same physical lake. dbt builds the conformed
          silver and the governed gold: the chargeback-by-reason table, the JBP-attainment-by-customer table, the
          POS-vs-forecast-by-SKU-by-retailer table, the carrier-OTD-by-lane table, the new-item-launch tracker.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
          Any compute engine reads those tables. Snowflake for BI, Athena for ad-hoc, Trino for the demand-sensing model,
          DuckDB at the customer-team lead's desk. The retailer-compliance agent, the demand-sensing agent, the trade-spend
          agent, and the production-scheduling agent all read the same gold tables that the customer-team lead reads.
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          The customer-team lead in a top-to-top with the MegaMart buyer and the agent recommending a re-route to avoid an
          MABD miss are looking at the same row in the same Iceberg table at the same timestamp. The number on the screen
          and the number the agent uses to make a recommendation are the same number.
        </p>
      </section>

      <section className="surface p-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">What gets unlocked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Chargebacks cut 30 to 50%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when at-risk shipments are flagged 36 to 72 hours before pickup instead of explained 2 weeks after in an EDI 824.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">JBP attainment up 5 to 10 points</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when every Q1 top-to-top commitment is a row in a gold table, watched in real time by the customer team and the agent.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Forecast MAPE moves from 18 to ~12%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when retailer POS, panel, weather, and promotion calendar reach the demand-sensing model the same day they reach the customer.</div>
          </div>
          <div className="border-l-4 border-[var(--crimson)] pl-3">
            <div className="font-semibold text-[var(--ink-strong)] text-sm">Trade ROI lifts 15 to 25%</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">when underperforming promotions are cut mid-flight, lift-vs-cannibalization is visible by promo, and funds redirect to JBP commitments at risk.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
