"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBouquetStore } from "@/store/bouquetStore";

export default function EditorBackButton() {
  const reset = useBouquetStore((s) => s.reset);
  const router = useRouter();
  const [hov, setHov] = useState(false);

  const handleBack = () => {
    reset();
    router.push("/");
  };

  return (
    <button
      onClick={handleBack}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "none", border: "none", padding: 0, cursor: "pointer",
        color: hov ? "#6B5E53" : "#3D2B1F",
        transition: "color 150ms",
      }}
    >
      <ArrowLeft size={20} strokeWidth={1.8} />
      <span className="editor-back-label" style={{ fontFamily: "var(--font-cormorant)", fontSize: 14 }}>Back</span>
    </button>
  );
}
