import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";
import { DemoAppProvider } from "@/components/demo-app-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Health Corner",
  description: "Diyetisyen ve danisan takibi icin web tabanli MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <DemoAppProvider>{children}</DemoAppProvider>
      </body>
    </html>
  );
}
