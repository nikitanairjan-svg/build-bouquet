"use client";

import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const endedRef = useRef(false);
  const timerDoneRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const minTimer = setTimeout(() => {
      timerDoneRef.current = true;
      if (endedRef.current) dismiss();
    }, 2000);

    // Fallback timer in case video doesn't load or play
    const fallbackTimer = setTimeout(() => {
      dismiss();
    }, 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallbackTimer);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !videoRef.current) return;

    const video = videoRef.current;

    const startVideo = async () => {
      try {
        // Ensure video is loaded
        video.load();

        // Wait for it to be ready
        await new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve(void 0);
          } else {
            video.addEventListener('canplay', () => resolve(void 0), { once: true });
          }
        });

        // Try to play
        await video.play();
      } catch (error) {
        // Autoplay failed - video will still show and dismiss via fallback timer
        console.log('Video autoplay failed:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startVideo, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  function dismiss() {
    setFading(true);
    setTimeout(() => setVisible(false), 300);
  }

  function handleEnded() {
    endedRef.current = true;
    if (timerDoneRef.current) dismiss();
  }

  // Only render on client to avoid hydration mismatch
  if (!mounted) return null;
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#F0E8D6",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 300ms ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Crop container: taller than viewport so 55px bleeds off each edge */}
      <div
        style={{
          position: "absolute",
          top: -55,
          left: 0,
          right: 0,
          bottom: -55,
        }}
      >
        <video
          ref={videoRef}
          src="/preloader/intro.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded} onError={handleEnded}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
