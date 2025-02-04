export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lobster, Pinyon_Script } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import DrawerButton from "@/components/DrawerButton";
import Header from "@/components/header/Header";
import Sidebar from "@/components/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const lobster = Lobster({ 
  subsets: ["latin"] ,
  weight: '400', 
  variable: '--font-lobster' 
});
const pinyon = Pinyon_Script({ 
  subsets: ["latin"],
  weight: '400', 
  variable: '--font-pinyon-script' 
});

export const metadata: Metadata = {
  title: "Dembu Shop",
  description: "Created by Denis Mbuthia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const date = new Date()
    const year = date.getFullYear()
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
            `${geistSans.variable} ${geistMono.variable} ${pinyon.variable} ${lobster.variable} antialiased`
        }
      >
        <Providers>
          <div className="drawer">
            <DrawerButton />
            <div className="drawer-content overflow-y-scroll custom-scrollbar">
              <div className="min-h-screen flex flex-col">
                <Header />
                <div className='flex mt-[60px] min-h-screen'>
                  {children}
                </div>
                <footer className="footer footer-center p-4 bg-base-300 text-base-content">
                  <p>
                    Copyright © {year} - All right reserved by Dembu Shop
                  </p>
                </footer>
              </div>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <Sidebar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
