import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/components/Home/Header";
import BootstrapClient from "@/components/hooks/BootstrapClient";
import Container from "@/components/Other/Container";
import GlobalMessages from "@/components/GlobalMessage";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";
import { auth } from "@/lib/auth"; 



export const metadata: Metadata = {
  metadataBase: new URL("https://vibeshared.com/"),
  title: {
    default: "Vibe Shared",
    template: "%s | Vibe Shared",
  },
  description:
    "VibeShared is the ultimate platform for creators and fans. Post content, get tips instantly, grow your audience, and earn more with our fair 35% platform fee. Join VibeShared today and turn your vibes into rewards.",
  openGraph: {
    title: "Vibe Shared – Connect, Support & Earn",
    description:
      "VibeShared is the ultimate platform for creators and fans. Post content, get tips instantly, grow your audience, and earn more with our fair 35% platform fee.",
    url: "https://vibeshared.com",
    siteName: "Vibe Shared",
    images: [
      {
        url: "https://vibeshared.com/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Vibe Shared Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Shared – Connect, Support & Earn",
    description:
      "VibeShared is the ultimate platform for creators and fans. Post content, get tips instantly, grow your audience, and earn more with our fair 35% platform fee.",
    images: ["https://vibeshared.com/icons/icon-512x512.png"],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ In Auth.js v5, auth() is used directly in Server Components
  const session = await auth();

  return (
    <html lang="en" >
      <body className="font-sans">
        <BootstrapClient />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <GlobalMessages />
        
        {/* ✅ Passing the session here hydrates the client-side useSession() hook instantly */}
        <SessionProvider session={session}
        refetchInterval={60}
          refetchOnWindowFocus={false}
        >
          <Header user={session?.user || null} />
          <Container>{children}</Container>
        </SessionProvider>

        <Analytics />
      </body>
    </html>
  );
}