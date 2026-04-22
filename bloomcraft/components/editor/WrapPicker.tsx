"use client";

import { useBouquetStore } from "@/store/bouquetStore";
import { WRAPS, WRAP_COLORS, getWrapImagePath } from "@/lib/wraps";

export default function WrapPicker() {
  const { wrapStyle, wrapColor, setWrapStyle, setWrapColor } =
    useBouquetStore();

  return (
    <div style={{ padding: "12px 10px 16px" }}>
      {/* 3 × 3 thumbnail grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {WRAPS.map((wrap) => {
          const selected = wrap.id === wrapStyle;
          return (
            <button
              key={wrap.id}
              title={wrap.name}
              onClick={() => setWrapStyle(wrap.id)}
              style={{
                background: "none",
                border: `2px solid ${selected ? "var(--rust)" : "rgba(44,26,14,0.10)"}`,
                borderRadius: 10,
                padding: 0,
                cursor: "pointer",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                transition: "border-color 150ms, box-shadow 150ms",
                boxShadow: selected
                  ? "0 0 0 3px rgba(168,86,42,0.15)"
                  : "none",
              }}
            >
              {/* Thumbnail image */}
              <div
                style={{
                  width: "100%",
                  height: 80,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={getWrapImagePath(wrap.id, wrapColor)}
                  alt={wrap.name}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Name label */}
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 9.5,
                  fontWeight: 500,
                  color: selected ? "var(--rust)" : "rgba(44,26,14,0.55)",
                  padding: "4px 4px 5px",
                  textAlign: "center",
                  lineHeight: 1.25,
                  letterSpacing: "0.02em",
                  width: "100%",
                  background: selected
                    ? "rgba(168,86,42,0.06)"
                    : "transparent",
                }}
              >
                {wrap.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Colour selector ──────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(44,26,14,0.08)",
          paddingTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {WRAP_COLORS.map((c) => {
          const active = c.id === wrapColor;
          return (
            <button
              key={c.id}
              title={c.label}
              onClick={() => setWrapColor(c.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: c.hex,
                  display: "block",
                  border: `2.5px solid ${active ? "var(--rust)" : "transparent"}`,
                  boxShadow: active
                    ? "0 0 0 2px rgba(168,86,42,0.2)"
                    : "0 0 0 1.5px rgba(44,26,14,0.12)",
                  transition: "border-color 150ms, box-shadow 150ms",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--rust)" : "rgba(44,26,14,0.55)",
                  letterSpacing: "0.04em",
                }}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
