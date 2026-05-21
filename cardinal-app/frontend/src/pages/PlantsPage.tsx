import { useEffect, useState } from 'react';
import { api } from '../api/queries';
import type { PlantsData, Plant } from '../types';
import PageHeader from '../components/PageHeader';
import USNetworkMap from '../components/USNetworkMap';
import AgentCard from '../components/AgentCard';

function utilColor(pct: number): string {
  if (pct >= 92) return 'var(--red)';
  if (pct >= 85) return 'var(--amber)';
  if (pct >= 70) return 'var(--forest)';
  return 'var(--ink-soft)';
}

export default function PlantsPage() {
  const [data, setData] = useState<PlantsData | null>(null);
  useEffect(() => { api.getPlants().then(setData).catch(() => {}); }, []);

  const markers = [
    ...(data?.owned ?? []).map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, kind: 'plant' as const, badge: `${p.capacity_utilization_pct}%` })),
    ...(data?.copack ?? []).map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, kind: 'copack' as const })),
  ];

  const ownedAvgOEE = data ? Math.round(data.owned.reduce((s, p) => s + (p.oee_pct ?? 0), 0) / data.owned.length) : 0;
  const ownedAvgUtil = data ? Math.round(data.owned.reduce((s, p) => s + p.capacity_utilization_pct, 0) / data.owned.length) : 0;
  const copackAvgUtil = data ? Math.round(data.copack.reduce((s, p) => s + p.capacity_utilization_pct, 0) / data.copack.length) : 0;
  const bottlenecks = data ? data.owned.filter((p) => p.bottleneck) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Plants and Co-pack"
        title="11 owned plants, 18 co-pack sites"
        subtitle="Capacity, OEE, changeover discipline, and the production-scheduling agent's load-balancing recommendations across owned and contract manufacturing."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card"><div className="kpi-label">Owned avg utilization</div><div className="kpi-value num">{ownedAvgUtil}%</div></div>
        <div className="kpi-card"><div className="kpi-label">Owned avg OEE</div><div className="kpi-value num">{ownedAvgOEE}%</div></div>
        <div className="kpi-card"><div className="kpi-label">Co-pack avg utilization</div><div className="kpi-value num">{copackAvgUtil}%</div></div>
        <div className="kpi-card"><div className="kpi-label">Active bottlenecks</div><div className="kpi-value num" style={{ color: bottlenecks.length > 0 ? 'var(--red)' : 'var(--forest)' }}>{bottlenecks.length}</div></div>
      </section>

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Manufacturing footprint</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Plant + co-pack utilization map</h2>
        </div>
        <div className="p-4">
          <USNetworkMap markers={markers} height={440} />
        </div>
      </section>

      {data?.scheduling_agent && (
        <div className="mb-6">
          <AgentCard agent={data.scheduling_agent} />
        </div>
      )}

      <section className="surface mb-6">
        <div className="surface-head">
          <div className="eyebrow">Owned plants</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Capacity, OEE, safety</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Location</th>
                <th>Category</th>
                <th className="num">Utilization</th>
                <th className="num">OEE</th>
                <th className="num">Changeover h/wk</th>
                <th className="num">Safety YTD</th>
                <th>Brands</th>
                <th>Bottleneck</th>
              </tr>
            </thead>
            <tbody>
              {data?.owned.map((p) => (
                <PlantRow key={p.id} plant={p} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface">
        <div className="surface-head">
          <div className="eyebrow">Co-pack contract manufacturers</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">18 partner sites</h2>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Site</th>
                <th>Location</th>
                <th>Category</th>
                <th className="num">Utilization</th>
                <th>Brands</th>
              </tr>
            </thead>
            <tbody>
              {data?.copack.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.id}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{p.name}</td>
                  <td>{p.category}</td>
                  <td className="num" style={{ color: utilColor(p.capacity_utilization_pct) }}>{p.capacity_utilization_pct}%</td>
                  <td className="text-xs">{p.brands.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PlantRow({ plant }: { plant: Plant }) {
  return (
    <tr>
      <td className="num">{plant.id}</td>
      <td className="font-semibold text-[var(--ink-strong)]">{plant.name}</td>
      <td>{plant.category}</td>
      <td className="num" style={{ color: utilColor(plant.capacity_utilization_pct) }}>{plant.capacity_utilization_pct}%</td>
      <td className="num">{plant.oee_pct ?? '—'}{plant.oee_pct ? '%' : ''}</td>
      <td className="num">{plant.changeover_hours_per_week ?? '—'}</td>
      <td className="num">{plant.safety_incidents_ytd ?? '—'}</td>
      <td className="text-xs">{plant.brands.join(', ')}</td>
      <td className="text-xs text-[var(--ink-muted)]">{plant.bottleneck ? <span className="text-[var(--red)] font-semibold">{plant.bottleneck}</span> : <span className="text-[var(--ink-soft)]">—</span>}</td>
    </tr>
  );
}
