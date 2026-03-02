'use client';

import { ConstellationData } from '@/types';
import IconBubble from './IconBubble';
import ConstellationLines from './ConstellationLines';

interface Props {
    data: ConstellationData;
    onOpenModal: (data: ConstellationData) => void;
}

const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': {
        position: 'fixed',
        top: '8%',
        left: '6%',
        zIndex: 10,
    },
    'top-right': {
        position: 'fixed',
        top: '6%',
        right: '5%',
        zIndex: 10,
    },
    'bottom-left': {
        position: 'fixed',
        top: '42%',
        left: '4%',
        zIndex: 10,
    },
    'bottom-right': {
        position: 'fixed',
        top: '40%',
        right: '4%',
        zIndex: 10,
    },
};

// Responsive position overrides for mobile
const mobilePositionStyles: Record<string, React.CSSProperties> = {
    'top-left': {
        position: 'fixed',
        top: '5%',
        left: '5%',
        zIndex: 10,
    },
    'top-right': {
        position: 'fixed',
        top: '5%',
        right: '5%',
        zIndex: 10,
    },
    'bottom-left': {
        position: 'fixed',
        top: '38%',
        left: '5%',
        zIndex: 10,
    },
    'bottom-right': {
        position: 'fixed',
        top: '38%',
        right: '5%',
        zIndex: 10,
    },
};

export default function ConstellationGroup({ data, onOpenModal }: Props) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const style = isMobile ? mobilePositionStyles[data.position] : positionStyles[data.position];

    // SVG lines dimensions
    const linesWidth = data.links.length >= 3 ? 200 : 160;
    const linesHeight = 100;

    return (
        <div
            style={style}
            className="flex flex-col items-center gap-2"
        >
            {/* Label */}
            <span className="constellation-label">
                {data.label}
            </span>

            {/* Icon row with glow outline and SVG lines behind */}
            <div className="relative flex flex-row items-center justify-center gap-3">
                {/* Pulsing glow outline */}
                <div className="constellation-glow" />

                {/* SVG constellation lines (behind the icons) */}
                <ConstellationLines
                    constellationId={data.id}
                    width={linesWidth}
                    height={linesHeight}
                />

                {/* Icon bubbles */}
                {data.links.map((link) => (
                    <IconBubble
                        key={link.id}
                        link={link}
                        onOpenModal={() => onOpenModal(data)}
                    />
                ))}
            </div>
        </div>
    );
}
