import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "DRG Dashboard",
  description: "Deep Rock Galactic stats dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${barlowCondensed.variable} font-sans antialiased`}>
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
