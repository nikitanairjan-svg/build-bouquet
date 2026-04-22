import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Petit_Formal_Script } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/shared/Preloader";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-jost",
  display: "swap",
});

const petitFormal = Petit_Formal_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-petit-formal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BloomCraft — Build Your Perfect Bouquet",
    template: "%s | BloomCraft",
  },
  description:
    "Design your dream bouquet with BloomCraft. Choose from hand-picked blooms, arrange them your way, and bring your floral vision to life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${petitFormal.variable}`}
    >
      <body className="antialiased" style={{ backgroundColor: "var(--paper)" }}>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
