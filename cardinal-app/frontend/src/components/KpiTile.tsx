export default function KpiTile({
  label, value, delta, deltaKind, hint,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaKind?: 'up' | 'down' | 'flat' | 'warn';
  hint?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && <div className={`kpi-delta ${deltaKind ?? 'flat'}`}>{delta}</div>}
      {hint && <div className="text-[11px] text-[var(--ink-soft)] mt-2 leading-snug">{hint}</div>}
    </div>
  );
}
