'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef } from 'react';
import ConstellationGroup from '@/components/ConstellationGroup';
import LinkModal from '@/components/LinkModal';
import { constellations } from '@/data/constellations';
import { ConstellationData } from '@/types';

// Dynamic import for WebGL overlay to avoid SSR issues
const DynamicSkyOverlay = dynamic(() => import('@/components/DynamicSkyOverlay'), { ssr: false });

// Map constellation positions to CSS transform-origin and translate offsets for the zoom
// Using a larger scale (3.5) requires different translation offsets to keep the constellation centered
const zoomTargets: Record<string, { transformOrigin: string; translate: string }> = {
  'top-left': { transformOrigin: '20% 20%', translate: 'translate(45%, 45%)' },
  'top-right': { transformOrigin: '80% 20%', translate: 'translate(-45%, 45%)' },
  'bottom-left': { transformOrigin: '20% 80%', translate: 'translate(45%, -45%)' },
  'bottom-right': { transformOrigin: '80% 80%', translate: 'translate(-45%, -45%)' },
};

export default function Home() {
  const [activeConstellation, setActiveConstellation] = useState<ConstellationData | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Disable parallax during zoom animation or before load
    if (isZooming || activeConstellation || !bgLoaded) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    if (bgRef.current) {
      bgRef.current.style.transform = `translate(${x * -8}px, ${y * -5}px) scale(1.05)`;
    }
    if (fgRef.current) {
      fgRef.current.style.transform = `translate(calc(-50% + ${x * 15}px), ${y * 8}px)`;
    }
  }, [isZooming, activeConstellation, bgLoaded]);

  const handleOpenConstellation = useCallback((constellation: ConstellationData) => {
    setIsZooming(true);
    setActiveConstellation(constellation);

    const target = zoomTargets[constellation.position];

    // Animate the background: zoom deep into the constellation's position
    if (bgRef.current) {
      bgRef.current.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      bgRef.current.style.transformOrigin = target.transformOrigin;
      bgRef.current.style.transform = `${target.translate} scale(3.5)`; // Increased scale
    }

    // Animate the silhouette: sink down and fade
    if (fgRef.current) {
      fgRef.current.style.transition = 'transform 1.1s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease';
      fgRef.current.style.transform = 'translate(-50%, 40%)';
      fgRef.current.style.opacity = '0.1';
    }

    // After the zoom animation completes, reveal the content
    setTimeout(() => {
      setShowContent(true);
    }, 850);
  }, []);

  const handleClose = useCallback(() => {
    setShowContent(false);

    // Reverse the zoom animation
    if (bgRef.current) {
      bgRef.current.style.transition = 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      bgRef.current.style.transformOrigin = 'center center';
      bgRef.current.style.transform = 'scale(1.05)';
    }

    // Bring the silhouette back
    if (fgRef.current) {
      fgRef.current.style.transition = 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease 0.2s';
      fgRef.current.style.transform = 'translateX(-50%)';
      fgRef.current.style.opacity = '1';
    }

    // After reverse animation, clear state
    setTimeout(() => {
      setActiveConstellation(null);
      setIsZooming(false);
    }, 700);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: '#020510' }}
      onMouseMove={handleMouseMove}
    >
      {/* Layer 1: WebGL canvas renders the sky image with natural twinkling stars */}
      <div
        ref={bgRef}
        className="fixed inset-0"
        style={{
          zIndex: 0,
          transition: 'transform 0.15s ease-out',
          transform: 'scale(1.05)',
        }}
      >
        <DynamicSkyOverlay onLoad={() => setBgLoaded(true)} />
      </div>

      {/* Layer 2: Constellations - Fade in only after bg is loaded */}
      {constellations.map((c) => (
        <div
          key={c.id}
          style={{
            transition: 'opacity 0.8s ease 0.2s', // slight delay after bg load
            opacity: bgLoaded && (!activeConstellation || activeConstellation.id !== c.id) ? 1 : 0,
            pointerEvents: activeConstellation || !bgLoaded ? 'none' : 'auto',
          }}
        >
          <ConstellationGroup
            data={c}
            onOpenModal={() => handleOpenConstellation(c)}
          />
        </div>
      ))}

      {/* Layer 3: Silhouette foreground - Fade in only after bg is loaded */}
      <div
        ref={fgRef}
        className="fixed bottom-0 left-1/2 pointer-events-none"
        style={{
          zIndex: 20,
          transform: 'translateX(-50%)',
          width: 'clamp(280px, 40vw, 550px)',
          transition: 'transform 0.15s ease-out, opacity 1s ease 0.3s',
          opacity: bgLoaded && !isZooming ? 1 : 0, // Hidden initially and fades during zoom
        }}
      >
        <img
          src="/assets/person-silhouette.webp"
          alt="Person looking up at the stars"
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>

      {/* Layer 4: Immersive Modal (shown after zoom animation) */}
      <LinkModal
        constellation={activeConstellation}
        onClose={handleClose}
        showContent={showContent}
      />
    </main>
  );
}
