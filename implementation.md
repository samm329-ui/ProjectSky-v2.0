# Project Implementation Documentation: Constellation Linktree

This document provides a technical overview of how the Constellation Linktree project is built and how its key features work.

## 1. Technology Stack

- **Framework**: Next.js 16.1 (using Turbopack for faster development).
- **Styling**: Tailwind CSS v4 (native CSS variables support).
- **Graphics**: Three.js (WebGL) for real-time image processing.
- **State Management**: React Hooks (useState, useCallback, useRef).

---

## 2. Key Features

### ✨ Dynamic Sky Overlay (Twinkling Stars)

The "twinkling" is not an overlay of particles; it is **real-time manipulation of the background image's pixels** via GLSL shaders.

- **Star Detection**: The fragment shader calculates pixel luminance. Pixels above a certain brightness threshold are identified as "stars."
- **Modulation**: We apply layered noise (FBM) and sine waves to modulate the brightness of these stars, creating an organic, atmospheric twinkling effect.
- **Masking**:
  - `skyMask`: Restricts twinkling to the upper sky portion.
  - `personMask`: A radial exclusion zone around the silhouette to prevent flickering near the person.

### 🚀 3D Animated Constellation Opening

When a constellation is clicked, a cinematic "flight" animation occurs:

- **Zoom Logic**: `page.tsx` manages a `zoomTargets` mapping that defines the `transform-origin` and `translate` offsets for each quadrant.
- **Background Scaling**: The background scales to **3.5x**, creating a deep dive effect.
- **Silhouette Transformation**: The foreground silhouette sinks and fades to enhance the sense of scale.
- **Parallax Suspension**: Mouse-driven parallax is disabled during the zoom to avoid visual jitters.

### 🖼️ Optimized Assets

- **Format**: All primary assets are in **WebP** format.
- **Galaxy Background**: Compressed to ~200KB (60% smaller than original).
- **Silhouette**: High-resolution outline compressed to **16KB** (98% smaller than original).
- **Loading Phase**: The UI remains hidden until the WebGL texture is fully loaded, preventing any initial visual flash (FOUC).

### 🌌 Constellation Engine

- Data-driven rendering based on `src/data/constellations.ts`.
- SVGs are used for the connecting lines, ensuring they are sharp at any zoom level.
- Staggered link reveal in the modal using custom CSS keyframes (`linkSlideIn`).

---

## 3. Deployment

- The project is deployed on **Vercel** with automatic production builds.
- All code is synchronized with the **GitHub** repository (`master` branch).

---
*Created by Antigravity AI*
