"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 280); }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 280ms ease, transform 280ms ease",
        backgroundColor: "var(--brown-dark)",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "var(--font-jost)",
        fontSize: 13,
        fontWeight: 400,
        letterSpacing: "0.03em",
        padding: "10px 20px",
        borderRadius: 99,
        boxShadow: "0 4px 24px rgba(44,31,20,0.30)",
        zIndex: 9999,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
