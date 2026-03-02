'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StarField() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // ── Detect reduced motion ──
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ── Renderer ──
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // ── Scene & Camera ──
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 1;

        // ── Star count (scales with viewport) ──
        const starCount = Math.min(
            Math.max(Math.floor((window.innerWidth * window.innerHeight) / 1500), 800),
            3000
        );

        // ── Geometry ──
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const seeds = new Float32Array(starCount);
        const speeds = new Float32Array(starCount);
        const minAlphas = new Float32Array(starCount);
        const maxAlphas = new Float32Array(starCount);

        const colorPalette = [
            { r: 220 / 255, g: 235 / 255, b: 255 / 255, weight: 0.7 },  // white/silver
            { r: 150 / 255, g: 180 / 255, b: 255 / 255, weight: 0.2 },  // blue-white
            { r: 255 / 255, g: 240 / 255, b: 200 / 255, weight: 0.1 },  // warm yellow
        ];

        for (let i = 0; i < starCount; i++) {
            // Random position in a wide spread
            positions[i * 3] = (Math.random() - 0.5) * 4;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 3;     // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.5; // z

            // Weighted random color
            const rand = Math.random();
            let color;
            if (rand < colorPalette[0].weight) {
                color = colorPalette[0];
            } else if (rand < colorPalette[0].weight + colorPalette[1].weight) {
                color = colorPalette[1];
            } else {
                color = colorPalette[2];
            }
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Per-star attributes
            sizes[i] = Math.random() * 0.9 + 0.3;     // 0.3 – 1.2
            seeds[i] = Math.random();                   // 0.0 – 1.0
            speeds[i] = Math.random() * 1.7 + 0.3;     // 0.3 – 2.0
            minAlphas[i] = Math.random() * 0.15 + 0.05; // 0.05 – 0.2
            maxAlphas[i] = Math.random() * 0.3 + 0.3;   // 0.3 – 0.6
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        geometry.setAttribute('aMinAlpha', new THREE.BufferAttribute(minAlphas, 1));
        geometry.setAttribute('aMaxAlpha', new THREE.BufferAttribute(maxAlphas, 1));

        // ── Shader Material ──
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
            },
            vertexShader: `
        attribute float aSize;
        attribute float aSeed;
        attribute float aSpeed;
        attribute float aMinAlpha;
        attribute float aMaxAlpha;
        attribute vec3 aColor;

        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uReducedMotion;

        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vColor = aColor;

          // Twinkling
          if (uReducedMotion > 0.5) {
            vAlpha = mix(aMinAlpha, aMaxAlpha, 0.7);
          } else {
            float flicker = sin(uTime * aSpeed + aSeed * 6.2831) * 0.5 + 0.5;
            vAlpha = mix(aMinAlpha, aMaxAlpha, flicker);
          }

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (40.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          // Circular point
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          // Soft glow falloff
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 2.5);

          gl_FragColor = vec4(vColor, vAlpha * strength);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        // ── Animation loop ──
        const clock = new THREE.Clock();
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            material.uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
        };
        animate();

        // ── Resize handler ──
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // ── Cleanup ──
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden="true"
        />
    );
}
