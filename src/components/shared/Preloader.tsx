"use client";

import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  // Video starts hidden. We reveal it only after play() succeeds so the
  // browser never has a chance to paint the native play-button overlay.
  const [showVideo, setShowVideo] = useState(false);
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
        video.load();

        await new Promise<void>((resolve) => {
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.addEventListener("canplay", () => resolve(), { once: true });
          }
        });

        await video.play();
        // Play succeeded — reveal the video. Because it was hidden the whole
        // time, the browser never showed the native play-button UI.
        setShowVideo(true);
      } catch {
        // Autoplay blocked (iOS / Android). The video is already hidden so
        // no play icon ever appeared. Mark as ended so the 2-second min-timer
        // dismisses the preloader; dismiss immediately if the timer already fired.
        endedRef.current = true;
        if (timerDoneRef.current) dismiss();
      }
    };

    const timer = setTimeout(startVideo, 50);
    return () => clearTimeout(timer);
  }, [mounted]);

  function dismiss() {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      (window as Window & { __preloaderDone?: boolean }).__preloaderDone = true;
      window.dispatchEvent(new CustomEvent("preloader:done"));
    }, 300);
  }

  function handleEnded() {
    endedRef.current = true;
    if (timerDoneRef.current) dismiss();
  }

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo shown while video is hidden (mobile / autoplay blocked).
          Fades out once the video takes over. */}
      {mounted && (
        <img
          src="/preloader/logo.svg"
          alt=""
          aria-hidden="true"
          style={{
            width: 80,
            height: 80,
            position: "relative",
            zIndex: 1,
            opacity: showVideo ? 0 : 0.45,
            transform: showVideo ? "scale(0.92)" : "scale(1)",
            transition: "opacity 400ms ease, transform 400ms ease",
            animation: showVideo ? "none" : "preloader-breathe 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Video — rendered but invisible until play() resolves.
          Using opacity:0 → opacity:1 so the video is already loaded and
          playing when it becomes visible (no black flash). */}
      {mounted && (
        <div
          style={{
            position: "absolute",
            top: -55,
            left: 0,
            right: 0,
            bottom: -55,
            opacity: showVideo ? 1 : 0,
            transition: showVideo ? "opacity 400ms ease" : "none",
          }}
        >
          <video
            ref={videoRef}
            src="/preloader/intro.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={handleEnded}
            onError={handleEnded}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes preloader-breathe {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.70; }
        }
      `}</style>
    </div>
  );
}
