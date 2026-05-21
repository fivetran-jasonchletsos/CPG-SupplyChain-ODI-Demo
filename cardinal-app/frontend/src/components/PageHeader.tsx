export default function PageHeader({
  eyebrow, title, subtitle,
}: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <div className="eyebrow mb-2">{eyebrow}</div>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink-strong)]">{title}</h1>
      {subtitle && (
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed max-w-3xl">{subtitle}</p>
      )}
    </header>
  );
}
