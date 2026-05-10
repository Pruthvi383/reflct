import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens",
  description: "Know if your AI stack is costing you"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
