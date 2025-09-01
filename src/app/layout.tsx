// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/componenets/Other/SessionWrapper";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/componenets/Home/Header";
import BootstrapClient from "@/componenets/Other/BootstrapClient";
import Container from "@/componenets/Other/Container";
import { Inter, Poppins } from "next/font/google";
import Footer from "@/componenets/Home/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vibe Shared",
    template: "%s | Vibe Shared", // Page titles will use this pattern
  },
  description: "Discover the latest Bollywood & Kollywood movies, posters, and updates.",
  openGraph: {
    title: "Vibe Shared",
    description: "Discover the latest Movies, posters, and updates.",
    url: "https://vibeshared.com",
    siteName: "Vibe Shared",
    images: [
      {
        url: "/icons/icon-512x512.png", // Replace with your logo/poster
        width: 512,
        height: 512,
        alt: "Vibe Shared",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Shared",
    description: "Discover the latest Movies, posters, and updates.",
    images: ["/icons/icon-512x512.png"],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <BootstrapClient />
        <Container>
          <SessionProvider>
            <Header />
            {children}
            <Footer />
          </SessionProvider>
        </Container>
      </body>
    </html>
  );
}
