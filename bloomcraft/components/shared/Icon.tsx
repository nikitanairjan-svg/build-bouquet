import React from "react";

// ─── Types ────────────────────────────────────────────────────

export type IconName =
  | "undo"
  | "redo"
  | "shuffle"
  | "trash"
  | "clear"
  | "rotateLeft"
  | "rotateRight"
  | "plus"
  | "minus"
  | "copy"
  | "share"
  | "link"
  | "download"
  | "back"
  | "arrow"
  | "heart"
  | "chat"
  | "chevronDown";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// ─── Path Definitions (16 × 16 viewBox) ──────────────────────
// All icons: stroke="currentColor", fill="none"
// Consistent: round linecap, round linejoin, stroke-width 1.8

const PATHS: Record<IconName, React.ReactNode> = {
  // Counter-clockwise arc arrow
  undo: (
    <>
      <path d="M3.5 9A4.5 4.5 0 1 1 8 4.5H5.5" />
      <polyline points="3 2.5 5.5 4.5 3.5 7" />
    </>
  ),

  // Clockwise arc arrow (mirror of undo)
  redo: (
    <>
      <path d="M12.5 9A4.5 4.5 0 1 0 8 4.5h2.5" />
      <polyline points="13 2.5 10.5 4.5 12.5 7" />
    </>
  ),

  // Two crossing arrows (top-left→bottom-right & bottom-left→top-right)
  shuffle: (
    <>
      <path d="M1.5 5H5l6 6h2.5" />
      <polyline points="11.5 3 13.5 5 11.5 7" />
      <path d="M1.5 11H5l6-6h2.5" />
      <polyline points="11.5 9 13.5 11 11.5 13" />
    </>
  ),

  // Trash can with lid and vertical slot
  trash: (
    <>
      <polyline points="2.5 5 13.5 5" />
      <path d="M6.5 5V3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V5" />
      <path d="M4.5 5.5 5.5 13h5l1-7.5" />
      <line x1="8" y1="7.5" x2="8" y2="11" />
    </>
  ),

  // × mark
  clear: (
    <>
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </>
  ),

  // Arc with counter-clockwise arrowhead (rotation around a point)
  rotateLeft: (
    <>
      <path d="M5 5A5 5 0 1 0 5.5 11" />
      <polyline points="2.5 3 5 5 7 3" />
    </>
  ),

  // Arc with clockwise arrowhead
  rotateRight: (
    <>
      <path d="M11 5A5 5 0 1 1 10.5 11" />
      <polyline points="13.5 3 11 5 9 3" />
    </>
  ),

  // + cross
  plus: (
    <>
      <line x1="8" y1="2.5" x2="8" y2="13.5" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
    </>
  ),

  // − dash
  minus: <line x1="2.5" y1="8" x2="13.5" y2="8" />,

  // Two overlapping rectangles
  copy: (
    <>
      <rect x="5.5" y="1.5" width="8" height="8.5" rx="1" />
      <path d="M3.5 5.5H3a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h6.5a1 1 0 0 0 1-1v-.5" />
    </>
  ),

  // Arrow pointing up out of a tray
  share: (
    <>
      <path d="M8 1.5V10" />
      <polyline points="4.5 5 8 1.5 11.5 5" />
      <path d="M3.5 9.5V13a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.5" />
    </>
  ),

  // Two interlinked ovals (chain link)
  link: (
    <>
      <path d="M7 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7.5 4" />
      <path d="M9 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L8.5 12" />
    </>
  ),

  // Arrow pointing down onto an underline
  download: (
    <>
      <path d="M8 1.5V10" />
      <polyline points="4.5 6.5 8 10 11.5 6.5" />
      <line x1="2.5" y1="14" x2="13.5" y2="14" />
    </>
  ),

  // Left-pointing arrow (back / previous)
  back: (
    <>
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
      <polyline points="6.5 4 2.5 8 6.5 12" />
    </>
  ),

  // Right-pointing arrow
  arrow: (
    <>
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
      <polyline points="9.5 4 13.5 8 9.5 12" />
    </>
  ),

  // Heart / favourite
  heart: (
    <path d="M8 13.5C7 12.7 1.5 9.2 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5c0 3.7-5.5 7.2-6.5 8z" />
  ),

  // Speech bubble (rounded rect with tail at bottom-left)
  chat: (
    <path d="M13.5 9.5A1.5 1.5 0 0 1 12 11H5.5L2.5 14V3.5A1.5 1.5 0 0 1 4 2h8A1.5 1.5 0 0 1 13.5 3.5v6z" />
  ),

  // ∨ chevron
  chevronDown: <polyline points="4 6.5 8 10.5 12 6.5" />,
};

// ─── Component ────────────────────────────────────────────────

export default function Icon({
  name,
  size = 16,
  strokeWidth = 1.8,
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
