export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="surface p-6 mb-10" style={{ borderColor: 'var(--crimson)' }}>
        <div className="eyebrow mb-2">The ODI Story</div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: 'var(--crimson-dark)' }}
        >
          Read the full ODI Story →
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">ODI Reference Architecture</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">About Cardinal Provisions</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Cardinal Provisions is a fictional Fortune-200 consumer packaged goods manufacturer used to
          demonstrate how an integrated supply-chain control tower runs on Fivetran's Open Data Infrastructure.
          Three categories, 24 brands, 11 owned plants, 18 co-pack contract manufacturers, 9 regional
          distribution centers, 280K retail doors plus Amazon. Roughly $32B in annual revenue and 38K employees.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="surface p-5">
              <div className="layer-chip crimson inline-flex mb-3">{p.tag}</div>
              <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Who this is built for</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="surface p-5">
            <div className="eyebrow mb-2">Chief Supply Chain Officer</div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">One view of the network</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              Plant capacity, co-pack load, DC inventory, retailer OTIF, chargeback exposure,
              commodity hedges, and Scope 3 intensity. One governed lake, one set of definitions,
              every engine. No screen-shopping across five vendor consoles.
            </p>
          </div>
          <div className="surface p-5">
            <div className="eyebrow mb-2">VP of Demand Planning</div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">A forecast that reads the world</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              Statistical baseline plus retailer POS, syndicated panel, promotion calendar, weather,
              and the demand-sensing agent that rewrites the 13-week plan every six hours.
              The agent reads the same Iceberg tables the planner does.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Tech stack</h2>
        <div className="surface p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-serif font-semibold text-[var(--ink-strong)]">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-sm bg-[var(--cream-deep)] border border-[var(--hairline)] p-5 text-sm text-[var(--ink)]">
        <div className="eyebrow mb-2" style={{ color: 'var(--amber)' }}>Disclaimer</div>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">All data shown is synthetic.</strong>{' '}
          Cardinal Provisions, the 24 brands, the retailer aliases, and the plant and DC coordinates are fictional
          and not affiliated with any real company. No portion of this site constitutes operational guidance for
          any real organization.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  {
    tag: 'Pillar 1',
    title: 'Customer-owned storage',
    body: 'All ingested data lands in Cardinal\'s S3 bucket as Apache Iceberg tables. Fivetran writes; Cardinal reads with any engine.',
  },
  {
    tag: 'Pillar 2',
    title: 'Open table format',
    body: 'Iceberg v2 provides ACID transactions, schema evolution, time-travel, and partition evolution. No vendor lock-in on layout.',
  },
  {
    tag: 'Pillar 3',
    title: 'Any compute engine',
    body: 'Snowflake for BI, Athena for ad-hoc, Trino for ML, DuckDB at the desk. Same files. No re-ingestion.',
  },
];

const STACK = [
  { layer: 'Ingest',     name: 'Fivetran connectors',          note: 'SAP S/4HANA, Manhattan WMS, Oracle TMS, Salesforce, Retail Link, Vendor Central, syndicated panel, commodity feed, sustainability DW' },
  { layer: 'Storage',    name: 'Amazon S3',                    note: 'cardinal-odi-lake bucket holds bronze, silver, gold prefixes' },
  { layer: 'Format',     name: 'Apache Iceberg v2',            note: 'Parquet files, ZSTD-compressed, Glue REST catalog' },
  { layer: 'Catalog',    name: 'AWS Glue Data Catalog',        note: 'Iceberg REST and table-level access control' },
  { layer: 'Transform',  name: 'dbt',                          note: 'Iceberg-native materializations across bronze, silver, gold, marts' },
  { layer: 'Query',      name: 'Snowflake, Athena, Trino, DuckDB', note: 'Four engines on the same files' },
  { layer: 'Frontend',   name: 'React 19, Vite, Tailwind v4',  note: 'Static SPA on GitHub Pages, reads JSON snapshot' },
  { layer: 'Charts',     name: 'Recharts',                     note: 'Composable charts for forecast, OTIF, commodity time-series' },
];
