import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProfile } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PitWall — F1 Statistics",
  description:
    "PitWall: Formula 1 statistics, drivers and races. Compare drivers and follow the season.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPro } = await getProfile();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar email={user?.email ?? null} isPro={isPro} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
