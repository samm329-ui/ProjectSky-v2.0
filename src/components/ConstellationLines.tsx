'use client';

interface Props {
    constellationId: string;
    width: number;
    height: number;
}

// Each constellation has a unique star pattern (dot coordinates + line connections)
const patterns: Record<string, { dots: [number, number][]; lines: [number, number][] }> = {
    // Social: Diamond/oval shape
    social: {
        dots: [
            [30, 10], [70, 5], [110, 15],
            [15, 40], [55, 50], [95, 45],
            [40, 75], [80, 70],
        ],
        lines: [
            [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
            [3, 4], [4, 5], [3, 6], [4, 6], [4, 7], [5, 7],
        ],
    },
    // Portfolio: House/pentagon shape
    portfolio: {
        dots: [
            [50, 5], [15, 30], [85, 30],
            [10, 65], [50, 50], [90, 65],
            [30, 80], [70, 80],
        ],
        lines: [
            [0, 1], [0, 2], [1, 3], [2, 5],
            [1, 4], [2, 4], [3, 6], [4, 6], [4, 7], [5, 7],
        ],
    },
    // Projects: Horizontal arch
    projects: {
        dots: [
            [10, 30], [45, 8], [85, 12], [120, 35],
            [25, 55], [60, 45], [95, 50],
            [45, 75], [80, 72],
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [0, 4], [1, 5],
            [2, 6], [3, 6], [4, 5], [5, 6],
            [4, 7], [5, 7], [5, 8], [6, 8],
        ],
    },
    // Knowledge: W-shape / angular
    knowledge: {
        dots: [
            [10, 15], [45, 35], [75, 10], [110, 30],
            [25, 55], [55, 60], [90, 55],
            [40, 80], [75, 75],
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [0, 4], [1, 4],
            [1, 5], [2, 5], [2, 6], [3, 6],
            [4, 7], [5, 7], [5, 8], [6, 8],
        ],
    },
};

export default function ConstellationLines({ constellationId, width, height }: Props) {
    const pattern = patterns[constellationId];
    if (!pattern) return null;

    // Scale dots to fit within the SVG
    const scaleX = width / 130;
    const scaleY = height / 90;

    const scaledDots = pattern.dots.map(([x, y]) => [x * scaleX, y * scaleY] as [number, number]);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: -1 }}
            aria-hidden="true"
        >
            {/* Lines */}
            {pattern.lines.map(([from, to], i) => (
                <line
                    key={`line-${i}`}
                    x1={scaledDots[from][0]}
                    y1={scaledDots[from][1]}
                    x2={scaledDots[to][0]}
                    y2={scaledDots[to][1]}
                    stroke="rgba(150, 200, 255, 0.35)"
                    strokeWidth="1"
                />
            ))}
            {/* Dots */}
            {scaledDots.map(([x, y], i) => (
                <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="rgba(180, 220, 255, 0.9)"
                >
                    {/* Subtle glow animation */}
                    <animate
                        attributeName="opacity"
                        values="0.6;1;0.6"
                        dur={`${2 + i * 0.3}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}
        </svg>
    );
}
