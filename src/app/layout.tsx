import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { StoreHydrator } from "@/components/store-hydrator";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stockroom: Inventory Catalog",
    template: "%s · Stockroom",
  },
  description:
    "A SaaS inventory catalog dashboard with cached search, tag filtering and typed async data ingestion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
