import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPAT — Show up. Stack points.",
  description: "Your daily home for crypto challenges, missions, and community competition."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
