import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPAT — Show up. Stack points.",
  description: "A daily Web3 participation platform for crypto challenges, missions, and community progress.",
  applicationName: "SPAT",
  openGraph: {
    title: "SPAT — Show up. Stack points.",
    description: "Take on crypto challenges, complete missions, and build your daily Web3 routine.",
    type: "website",
    siteName: "SPAT"
  },
  twitter: {
    card: "summary_large_image",
    title: "SPAT — Show up. Stack points.",
    description: "Take on crypto challenges, complete missions, and build your daily Web3 routine."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
