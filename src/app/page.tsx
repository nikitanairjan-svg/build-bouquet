import Hero from "@/components/landing/Hero";
import ActionCards from "@/components/landing/ActionCards";
import Footer from "@/components/landing/Footer";
import PaperGrain from "@/components/landing/PaperGrain";

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: "var(--lnd-bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ── Content layer — z-index 2 ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <main className="lnd-above-fold">
          <Hero />
          <ActionCards />
        </main>
        <Footer />
      </div>

      {/* ── Paper grain overlay ── */}
      <PaperGrain />
    </div>
  );
}
