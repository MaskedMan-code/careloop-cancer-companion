import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoProvider } from "@/lib/DemoContext";

export const metadata: Metadata = {
  title: "CareLoop — Continuous care, beyond the hospital.",
  description:
    "CareLoop is a dual AI + Human Cancer Care Companion prototype built for Health-a-thon 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B3D3F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
