import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Petit_Formal_Script } from "next/font/google";
import Script from "next/script";
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
      suppressHydrationWarning
    >
      <body className="antialiased" style={{ backgroundColor: "var(--paper)" }}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9G9PFWH7DM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9G9PFWH7DM');
          `}
        </Script>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
