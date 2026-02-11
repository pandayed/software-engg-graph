interface GridProps {
  show: boolean;
  density: number;
  transform: { x: number; y: number; scale: number };
}

export default function Grid({ show, density, transform }: GridProps) {
  if (!show) return null;

  const gridSize = density;
  const scaledGridSize = gridSize * transform.scale;

  const offsetX = transform.x % scaledGridSize;
  const offsetY = transform.y % scaledGridSize;

  return (
    <svg className="graph-grid">
      <defs>
        <pattern
          id="grid-pattern"
          width={scaledGridSize}
          height={scaledGridSize}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`}
            fill="none"
            stroke="var(--grid-color)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
}

