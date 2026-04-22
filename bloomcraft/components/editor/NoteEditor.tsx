"use client";

import { useState, useEffect } from "react";
import { useBouquetStore } from "@/store/bouquetStore";
import Icon from "@/components/shared/Icon";

const INK_COLORS = [
  { label: "Ink",       value: "#1A1A2E" },
  { label: "Rust",      value: "#A8562A" },
  { label: "Rose",      value: "#B85470" },
  { label: "Sage",      value: "#4A7A42" },
  { label: "Mauve",     value: "#7A5090" },
  { label: "Dusk",      value: "#5A5080" },
];

export default function NoteEditor() {
  const { note, setNoteLive, removeNote, saveHistory } = useBouquetStore();

  // Mirror store → local so textarea stays responsive
  const [text, setText] = useState(note?.text ?? "");
  const [color, setColor] = useState(note?.color ?? INK_COLORS[0].value);

  // Keep local state in sync if the store changes externally (e.g. undo)
  useEffect(() => {
    setText(note?.text ?? "");
    if (note?.color) setColor(note.color);
  }, [note]);

  const [hasSavedHistory, setHasSavedHistory] = useState(false);

  const handleFocus = () => {
    // Save one history snapshot before this editing session begins
    if (!hasSavedHistory) {
      saveHistory();
      setHasSavedHistory(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setNoteLive(newText, color);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (text.trim()) setNoteLive(text, newColor);
  };

  const handleRemove = () => {
    saveHistory();
    removeNote();
    setText("");
    hasSavedHistory.current = false;
  };

  return (
    <div style={{ padding: "14px 12px 16px" }}>
      {/* Ink colour picker */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {INK_COLORS.map((c) => {
          const active = c.value === color;
          return (
            <button
              key={c.value}
              title={c.label}
              onClick={() => handleColorChange(c.value)}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: c.value,
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: active
                  ? `0 0 0 2px var(--paper), 0 0 0 4px ${c.value}`
                  : "0 0 0 1.5px rgba(44,26,14,0.15)",
                transition: "box-shadow 150ms",
              }}
            />
          );
        })}
      </div>

      {/* Textarea in Petit Formal Script */}
      <textarea
        value={text}
        onChange={handleTextChange}
        onFocus={handleFocus}
        placeholder="Write a message…"
        rows={4}
        style={{
          width: "100%",
          resize: "none",
          background: "rgba(255,255,255,0.55)",
          border: "1.5px solid rgba(44,26,14,0.12)",
          borderRadius: 10,
          padding: "10px 12px",
          fontFamily: "var(--font-petit-formal)",
          fontSize: 15,
          lineHeight: 1.75,
          color,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 150ms",
        }}
        onFocusCapture={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor =
            "rgba(44,26,14,0.28)")
        }
        onBlur={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor =
            "rgba(44,26,14,0.12)")
        }
      />

      {/* Preview hint */}
      <p
        style={{
          fontFamily: "var(--font-jost)",
          fontSize: 10.5,
          color: "rgba(44,26,14,0.40)",
          marginTop: 7,
          letterSpacing: "0.03em",
        }}
      >
        Appears on canvas in real time
      </p>

      {/* Remove note button — only when text exists */}
      {text.trim() && (
        <button
          onClick={handleRemove}
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(168,86,42,0.07)",
            border: "1.5px solid rgba(168,86,42,0.18)",
            borderRadius: 8,
            padding: "7px 12px",
            cursor: "pointer",
            fontFamily: "var(--font-jost)",
            fontSize: 11.5,
            fontWeight: 500,
            color: "var(--rust)",
            letterSpacing: "0.03em",
            transition: "background 150ms",
            width: "100%",
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(168,86,42,0.13)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(168,86,42,0.07)")
          }
        >
          <Icon name="trash" size={13} />
          Remove note
        </button>
      )}
    </div>
  );
}
