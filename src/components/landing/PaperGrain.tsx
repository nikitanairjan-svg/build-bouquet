"use client";

import { useEffect, useRef } from "react";

// Draws warm pixel noise into a 256×256 canvas, then stretches it
// across the viewport as a fixed overlay. Canvas is the most reliable
// way to get real random grain — no SVG filter sandboxing issues.
export default function PaperGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to actual viewport size — no CSS scaling means no
    // bilinear interpolation artifacts (the source of diagonal patterns)
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const imageData = ctx.createImageData(W, H);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
      const luma = Math.random() * 255;
      d[i]     = luma;           // R
      d[i + 1] = luma * 0.95;   // G — slightly warm
      d[i + 2] = luma * 0.85;   // B — less blue = warmer grain
      d[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.07,
        mixBlendMode: "multiply",
      }}
    />
  );
}
