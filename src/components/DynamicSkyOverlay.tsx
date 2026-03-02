'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * This component renders a fullscreen quad that samples the background image
 * and makes the ACTUAL stars in the photograph twinkle naturally.
 * 
 * How it works:
 * 1. The background image is loaded as a texture.
 * 2. A fragment shader analyzes each pixel's brightness.
 * 3. Bright pixels (stars) get their brightness modulated over time using
 *    layered noise functions, creating organic, realistic twinkling.
 * 4. Dark pixels (sky, mountains) are left completely untouched.
 * 5. The result is rendered on a canvas that sits exactly on top of the
 *    CSS background, replacing it visually.
 */

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

// Hash function for pseudo-random values based on position
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

// 2D noise for smooth, organic variation
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion for complex, natural-looking variation
float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        total += noise(p) * amplitude;
        p *= 2.0;
        amplitude *= 0.5;
    }
    return total;
}

void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Calculate pixel brightness (luminance)
    float brightness = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    
    // Only affect bright pixels (stars). Slightly higher threshold to avoid catching
    // non-star elements like city lights and mountain edges
    float starMask = smoothstep(0.30, 0.60, brightness);
    
    // VERTICAL SKY MASK: Only twinkle in the sky area (upper part of image)
    // vUv.y = 1.0 at top, 0.0 at bottom
    float skyMask = smoothstep(0.35, 0.55, vUv.y);
    
    // SILHOUETTE EXCLUSION: Fade out twinkling near the person's head/shoulders
    // The silhouette is centered at bottom (x=0.5, y~0.35-0.45)
    // Create a radial distance from the person's head area
    vec2 personHead = vec2(0.5, 0.42); // approximate head position in UV
    float distFromPerson = distance(vUv, personHead);
    // Fade twinkle OUT when close to the person, fade IN when far enough away
    float personMask = smoothstep(0.08, 0.20, distFromPerson);
    
    // Combine: pixel must be bright, in the sky, AND away from the silhouette
    float finalMask = starMask * skyMask * personMask;
    
    // Create a unique, position-dependent twinkle for each star
    vec2 starId = floor(vUv * 500.0);
    float uniquePhase = hash(starId) * 6.28318;
    float uniqueSpeed = hash(starId + 100.0) * 1.5 + 0.8;
    
    // Layered twinkling: combine slow drift with faster flicker
    float slowDrift = fbm(vUv * 30.0 + uTime * 0.15) * 0.5 + 0.5;
    
    // Fast, sharp flicker (like atmospheric scintillation)
    float fastFlicker = sin(uTime * uniqueSpeed * 8.0 + uniquePhase) * 0.5 + 0.5;
    float fastFlicker2 = sin(uTime * uniqueSpeed * 5.0 + uniquePhase * 1.7) * 0.5 + 0.5;
    
    // Combine: multiply layers for complex, organic result
    float twinkle = slowDrift * fastFlicker * fastFlicker2;
    
    // Gentler power curve so the bright moments last longer and are more visible
    twinkle = pow(twinkle, 0.8);
    
    // DRAMATIC brightness range: stars dim to 30% and brighten to 200% of original
    float brightnessMultiplier = mix(0.3, 2.0, twinkle);
    
    // Apply the twinkle only to SKY STAR pixels, mountains/city lights stay untouched
    vec3 finalColor = mix(texColor.rgb, texColor.rgb * brightnessMultiplier, finalMask);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function DynamicSkyOverlay({ onLoad }: { onLoad?: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Fill background with near-black while loading to prevent white flash
        renderer.setClearColor(0x020510, 1);

        // Load the background image as a WebGL texture
        const textureLoader = new THREE.TextureLoader();
        const bgTexture = textureLoader.load('/assets/galaxy-background.webp', () => {
            // Called when texture is fully loaded
            if (onLoad) onLoad();
        });
        bgTexture.minFilter = THREE.LinearFilter;
        bgTexture.magFilter = THREE.LinearFilter;

        // Fullscreen quad with the twinkling shader
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: bgTexture },
                uTime: { value: 0 },
            },
            vertexShader,
            fragmentShader,
        });

        const quad = new THREE.Mesh(geometry, material);
        scene.add(quad);

        // Animation loop
        const clock = new THREE.Clock();
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            material.uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
            bgTexture.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
