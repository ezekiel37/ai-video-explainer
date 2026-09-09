import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExplainMotion",
  description: "Programmable explanation videos for technical and product process explainers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
