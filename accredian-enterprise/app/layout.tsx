import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const appFont = localFont({
  src: "../public/fonts/Arial.ttf",
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Accredian Enterprise Clone",
  description: "Partial enterprise learning landing page built with Next.js and Tailwind CSS."
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${appFont.variable} bg-white font-sans text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
