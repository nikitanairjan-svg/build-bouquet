"use client";

import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const endedRef = useRef(false);
  const timerDoneRef = useRef(false);

  useEffect(() => {
    const minTimer = setTimeout(() => {
      timerDoneRef.current = true;
      if (endedRef.current) dismiss();
    }, 2000);

    return () => clearTimeout(minTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setFading(true);
    setTimeout(() => setVisible(false), 300);
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
          src="/preloader/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
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
