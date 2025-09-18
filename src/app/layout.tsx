import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/componenets/hooks/SessionWrapper";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/componenets/Home/Header";
import BootstrapClient from "@/componenets/hooks/BootstrapClient";
import Container from "@/componenets/Other/Container";
import { Inter, Poppins } from "next/font/google";
import GlobalMessages from "@/componenets/GlobalMessage";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";

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
  metadataBase: new URL("https://vibeshared.com/"),
  title: {
    default: "Vibe Shared",
    template: "%s | Vibe Shared",
  },
  description: "Discover the latest Bollywood & Kollywood movies, posters, and updates.",
  openGraph: {
    title: "Vibe Shared",
    description: "Discover the latest Movies, posters, and updates.",
    url: "https://vibeshared.com",
    siteName: "Vibe Shared",
    images: [
      {
        url: "/icons/icon-512x512.png",
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
  // ✅ Now it’s inside request scope
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <BootstrapClient />

        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <GlobalMessages />

        <SessionProvider session={session}>
          <Header />
          <Container>{children}</Container>
        </SessionProvider>

        <Analytics />
      </body>
    </html>
  );
}
