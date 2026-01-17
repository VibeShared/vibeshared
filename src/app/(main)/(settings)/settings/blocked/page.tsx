// app/(main)/(settings)/settings/blocked/page.tsx
import { Suspense } from "react";
import BlockedUsersList from "./BlockedUsersList";

export const dynamic = "force-dynamic";

export default function BlockedPage() {
  return (
    <Suspense fallback={null}>
      <BlockedUsersList />
    </Suspense>
  );
}
