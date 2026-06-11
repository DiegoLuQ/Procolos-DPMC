import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protocolos",
  description: "Protocolos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased h-full m-0 bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
