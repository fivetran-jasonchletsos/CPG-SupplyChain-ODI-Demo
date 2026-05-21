import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="eyebrow mb-2">404</div>
      <h1 className="font-serif text-4xl font-semibold text-[var(--ink-strong)] mb-3">Off the shelf</h1>
      <p className="text-[var(--ink-muted)] mb-6">The page you requested is not in the planogram.</p>
      <Link to="/" className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-white px-5 py-3" style={{ background: 'var(--crimson)' }}>
        Back to home →
      </Link>
    </div>
  );
}
