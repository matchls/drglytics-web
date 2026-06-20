import type { Metadata } from "next";
import { Barlow_Condensed, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { PrefsProvider } from "@/lib/PrefsContext";
import { createClient } from "@/lib/supabase/server";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "DRG Dashboard",
  description: "Deep Rock Galactic stats dashboard",
  icons: {
    icon: "/icons/misc/drg_supporter.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lecture de l'utilisateur côté serveur — null si non connecté
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
        />
      </head>

      <body
        className={`${barlowCondensed.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-on-surface flex h-screen`}
      >
        <PrefsProvider>
          <SideNav />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar userEmail={user?.email ?? null} />
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
            <Footer />
          </div>
        </PrefsProvider>
      </body>
    </html>
  );
}
