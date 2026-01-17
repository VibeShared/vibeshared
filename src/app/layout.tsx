// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://vibeshared.com/"),
  title: {
    default: "Vibe Shared",
    template: "%s | Vibe Shared",
  },
  description:
    "VibeShared is the ultimate platform for creators and fans. Post content, get tips instantly, grow your audience, and earn more with our fair 35% platform fee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        

       {children}

        <Analytics />
      </body>
    </html>
  );
}
