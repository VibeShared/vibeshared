import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

import Header from "@/components/Home/Header";
import Container from "@/components/Other/Container";
import BootstrapClient from "@/components/Other/BootstrapClient";
import GlobalMessages from "@/components/GlobalMessage";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider
      session={session}
      refetchInterval={60}
      refetchOnWindowFocus={false}
    >
      <QueryProvider>
        <BootstrapClient />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <GlobalMessages />

        <Header user={session?.user || null} />
        <Container>{children}</Container>
      </QueryProvider>
    </SessionProvider>
  );
}

