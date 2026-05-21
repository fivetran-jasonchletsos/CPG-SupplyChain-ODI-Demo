# Cardinal Provisions — CPG Supply-Chain ODI Demo

A Fivetran Open Data Infrastructure (ODI) reference build for Consumer Packaged Goods, focused on supply chain. Cardinal Provisions is a fictional Fortune-200 CPG manufacturer: three categories (food and beverage, household care, personal care), 24 brands, 11 owned plants, 18 co-pack contract manufacturers, 9 regional DCs, 280K retail doors plus Amazon.

The demo speaks to a Chief Supply Chain Officer and a VP of Demand Planning.

## Live demo

https://fivetran-jasonchletsos.github.io/CPG-SupplyChain-ODI-Demo/

## Stack

- React 19 plus Vite 8 plus Tailwind v4
- Hash router for static GitHub Pages hosting
- Recharts for time-series and Leaflet for plant and DC geography
- Static JSON snapshots in `cardinal-app/frontend/public/data/` simulate gold-layer output

## Data sources represented

- SAP S/4HANA (ERP) — orders, shipments, production
- Manhattan Associates WMS — warehouse and inventory
- Oracle Transportation Management — freight and carrier
- Salesforce — retailer accounts
- Walmart Retail Link plus Amazon Vendor Central — POS feeds
- Nielsen, IRI, Circana style syndicated panel data
- CME style commodity-broker price feeds
- Sustainability data warehouse — Scope 1, 2, 3 emissions

All sources land in customer-owned Apache Iceberg on S3 via Fivetran connectors. dbt builds bronze, silver, gold layers. Any compute engine reads the same files.

## Local development

```bash
cd cardinal-app/frontend
npm install
npm run dev
```

## Deploy

Push to `main` — `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.

## Disclaimer

Synthetic data. Cardinal Provisions and the retailer aliases are fictional and not affiliated with any real company.
