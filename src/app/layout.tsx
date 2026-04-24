import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE PREMIUM LOUNGE | NFC Loyalty",
  description: "Exclusive NFC Loyalty program for THE PREMIUM LOUNGE.",
  themeColor: "#0f1115",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
