import type { Metadata } from "next";
import { Geist, Geist_Mono, Onest } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import YandexMetrika from "@/components/YandexMetrika";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
})

export const metadata: Metadata = {
  title: "Base Beauty",
  description: "Эксклюзивное оформление мероприятий от компании «Base-Beauty» - это визитная карточка самого высокого уровня",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Check if the current path is dashboard page
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminLogin = pathname.startsWith("/admin-login");

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${onest.variable} font-tt-runs antialiased bg-[#222222] min-h-screen ${(isDashboard || isAdminLogin) ? "font-onest" : "flex flex-col"}`}
      >
        {!(isDashboard || isAdminLogin) && <Header />}
        {(isDashboard || isAdminLogin) ? (
          children
        ) : (
          <main className="grow">
            {children}
            <YandexMetrika />
          </main>
        )}
        <Toaster />
        {!(isDashboard || isAdminLogin) && <Footer />}
      </body>
    </html>
  );
}
