// A lightweight inline SVG of the lower 48 with markers for plants, DCs, and retailers.
// Uses a simple equirectangular projection across the conterminous US viewbox.

interface Marker {
  lat: number;
  lon: number;
  label: string;
  kind: 'plant' | 'copack' | 'dc' | 'retailer';
  badge?: string;
}

// US bbox: roughly lat 24-50, lon -125 to -66.  Map to viewBox 0-1000 wide, 0-600 tall.
const LON_MIN = -125, LON_MAX = -66, LAT_MIN = 23.5, LAT_MAX = 50.5;
function project(lat: number, lon: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 1000;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 600;
  return { x, y };
}

const KIND_STYLE: Record<Marker['kind'], { fill: string; stroke: string; r: number; ring?: boolean }> = {
  plant:    { fill: '#b1182b', stroke: '#fafaf5', r: 9, ring: true },
  copack:   { fill: '#fafaf5', stroke: '#b1182b', r: 6 },
  dc:       { fill: '#14532d', stroke: '#fafaf5', r: 8 },
  retailer: { fill: '#d97706', stroke: '#fafaf5', r: 5 },
};

export default function USNetworkMap({ markers, height = 360 }: { markers: Marker[]; height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Cream backdrop */}
        <rect width="1000" height="600" fill="#fafaf5" />

        {/* Simplified US outline (broad strokes; not a survey map, just a context shape) */}
        <path
          d="M 80 240 L 140 180 L 220 150 L 310 120 L 410 110 L 510 105 L 600 110 L 700 130 L 790 160 L 870 200 L 920 250 L 940 320 L 920 380 L 860 430 L 780 460 L 700 470 L 620 478 L 540 482 L 460 478 L 380 470 L 300 460 L 230 440 L 170 410 L 130 360 L 100 310 Z"
          fill="#f1ede0"
          stroke="#cfc8b5"
          strokeWidth="1.5"
        />
        {/* Florida wedge */}
        <path d="M 780 460 L 800 510 L 820 540 L 830 530 L 820 480 Z" fill="#f1ede0" stroke="#cfc8b5" strokeWidth="1.5" />
        {/* Texas wedge */}
        <path d="M 410 470 L 430 530 L 470 540 L 490 510 L 470 478 Z" fill="#f1ede0" stroke="#cfc8b5" strokeWidth="1.5" />

        {/* State faint grid (latitude reference lines) */}
        {[30, 35, 40, 45].map((lat) => {
          const { y } = project(lat, -95);
          return <line key={lat} x1={80} x2={920} y1={y} y2={y} stroke="#e3ddcc" strokeDasharray="2 4" strokeWidth="0.6" />;
        })}

        {/* Markers */}
        {markers.map((m, i) => {
          const { x, y } = project(m.lat, m.lon);
          const s = KIND_STYLE[m.kind];
          return (
            <g key={i}>
              {s.ring && <circle cx={x} cy={y} r={s.r + 5} fill="none" stroke={s.fill} strokeOpacity="0.18" strokeWidth="2" />}
              <circle cx={x} cy={y} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
              {m.badge && (
                <text x={x + s.r + 4} y={y + 3} fontSize="10" fill="#2c2c2c" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                  {m.badge}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--ink-muted)]">
        <LegendDot color="#b1182b" label="Owned plant" ring />
        <LegendDot color="#fafaf5" stroke="#b1182b" label="Co-pack site" />
        <LegendDot color="#14532d" label="Distribution center" />
        <LegendDot color="#d97706" label="Top retailer DC" />
      </div>
    </div>
  );
}

function LegendDot({ color, stroke = '#fafaf5', label, ring }: { color: string; stroke?: string; label: string; ring?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-block">
        {ring && <span className="absolute -inset-0.5 rounded-full border" style={{ borderColor: color, opacity: 0.3 }} />}
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, border: `1.5px solid ${stroke}` }} />
      </span>
      {label}
    </span>
  );
}
