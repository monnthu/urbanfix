import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Reporting",
  description: "Report urban problems to verified government institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
