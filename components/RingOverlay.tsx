// Square container sized to 100vmin — centres the ring on any viewport ratio.
const CX = 50;
const CY = 50;
const R1 = 34;
const R2 = 41;
const TICK = 4;
const LABEL_DIST = R2 + 6;

const CARDINALS = [
  { deg: 0,   label: "N" },
  { deg: 90,  label: "E" },
  { deg: 180, label: "S" },
  { deg: 270, label: "W" },
] as const;

export function RingOverlay() {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: "100vmin", height: "100vmin" }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ opacity: 0.55 }}
        aria-hidden
      >
        <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#d4a832" strokeWidth={0.4} />
        <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#d4a832" strokeWidth={0.25} strokeDasharray="1 2" />

        {CARDINALS.map(({ deg, label }) => {
          const rad = (deg * Math.PI) / 180;
          const sin = Math.sin(rad);
          const cos = Math.cos(rad);
          return (
            <g key={label}>
              <line
                x1={CX + sin * (R2 + 1)}
                y1={CY - cos * (R2 + 1)}
                x2={CX + sin * (R2 + 1 + TICK)}
                y2={CY - cos * (R2 + 1 + TICK)}
                stroke="#d4a832"
                strokeWidth={0.5}
              />
              <text
                x={CX + sin * LABEL_DIST}
                y={CY - cos * LABEL_DIST + 1.2}
                textAnchor="middle"
                fill="#d4a832"
                fontSize={3}
                fontFamily="monospace"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
