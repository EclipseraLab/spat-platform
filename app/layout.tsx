import type { Metadata } from "next";
import "./globals.css";

const title = "SPAT — Show up. Stack points.";
const description = "A Web3 participation platform for community missions, crypto knowledge, daily check-ins, and arcade challenges.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "SPAT",
  icons: {
    icon: [
      { url: "/favicon.svg?v=4", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml", sizes: "512x512" }
    ],
    shortcut: "/favicon.svg?v=4",
    apple: [{ url: "/favicon.svg?v=4", sizes: "180x180", type: "image/svg+xml" }]
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "SPAT",
    url: "https://spat-platform.vercel.app"
  },
  twitter: {
    card: "summary",
    title,
    description
  },
  metadataBase: new URL("https://spat-platform.vercel.app")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
