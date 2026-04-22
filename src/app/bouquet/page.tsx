// Server component — exports OG/Twitter metadata, renders client receiver
import type { Metadata } from "next";
import BouquetReceiver from "./BouquetReceiver";

export const metadata: Metadata = {
  title: "Someone made you a digital bouquet!",
  description: "A handcrafted digital bouquet made with love on BloomCraft",
  openGraph: {
    title: "Someone made you a digital bouquet!",
    description: "A handcrafted digital bouquet made with love on BloomCraft",
    images: [{ url: "/og-bouquet.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Someone made you a digital bouquet!",
    description: "A handcrafted digital bouquet made with love on BloomCraft",
  },
};

export default function BouquetPage() {
  return <BouquetReceiver />;
}
