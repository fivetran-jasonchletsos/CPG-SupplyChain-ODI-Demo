import type { AgentBlock } from '../types';

export default function AgentCard({ agent }: { agent: AgentBlock }) {
  return (
    <section className="agent-card">
      <div className="flex items-start gap-3 mb-2">
        <span className="layer-chip crimson shrink-0 mt-0.5">Agent</span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{agent.title}</h3>
          <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{agent.summary}</p>
        </div>
      </div>

      {agent.recommendations && (
        <ul className="mt-3 space-y-2">
          {agent.recommendations.map((r, i) => (
            <li key={i} className="border-l-2 border-[var(--crimson)] pl-3 py-1">
              <div className="text-sm font-semibold text-[var(--ink-strong)]">{r.action}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">{r.rationale}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--crimson-dark)] mt-1">Confidence {r.confidence_pct}%</div>
            </li>
          ))}
        </ul>
      )}

      {agent.decisions && (
        <ul className="mt-3 space-y-2">
          {agent.decisions.map((r, i) => (
            <li key={i} className="border-l-2 border-[var(--crimson)] pl-3 py-1">
              <div className="text-sm font-semibold text-[var(--ink-strong)]">{r.action}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">{r.rationale}</div>
              <div className="text-[11px] text-[var(--crimson-dark)] mt-1"><span className="font-semibold">Redirect:</span> {r.redirect_to}</div>
            </li>
          ))}
        </ul>
      )}

      {agent.signals && (
        <ul className="mt-3 space-y-2">
          {agent.signals.map((s, i) => (
            <li key={i} className="border-l-2 border-[var(--crimson)] pl-3 py-1">
              <div className="text-sm font-semibold text-[var(--ink-strong)]"><span className="num">{s.sku}</span> — {s.signal}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">{s.recommendation}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--crimson-dark)] mt-1">Confidence {s.confidence_pct}%</div>
            </li>
          ))}
        </ul>
      )}

      {agent.at_risk_shipments && (
        <div className="mt-3 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Retailer</th>
                <th>DC</th>
                <th className="num">Pickup in</th>
                <th>Risk</th>
                <th>Reason and recommended action</th>
              </tr>
            </thead>
            <tbody>
              {agent.at_risk_shipments.map((s) => (
                <tr key={s.id}>
                  <td className="num">{s.id}</td>
                  <td>{s.retailer}</td>
                  <td className="num">{s.dc}</td>
                  <td className="num">{s.pickup_in_hours}h</td>
                  <td>
                    <span className={`pill ${s.risk === 'high' ? 'bad' : s.risk === 'medium' ? 'warn' : 'neutral'}`}>{s.risk}</span>
                  </td>
                  <td className="text-xs text-[var(--ink-muted)]">
                    <div className="text-[var(--ink)]">{s.reason}</div>
                    <div className="mt-1"><span className="text-[var(--crimson-dark)] font-semibold">Action: </span>{s.action}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
