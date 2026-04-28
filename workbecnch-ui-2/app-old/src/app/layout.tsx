import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eastaura Workbench",
  description: "Internal operating system for Eastaura wellness retreat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
