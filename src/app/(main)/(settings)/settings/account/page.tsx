// app/(main)/(settings)/settings/account/page.tsx
import { Suspense } from "react";
import DeleteAccount from "./DeleteAccount";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <DeleteAccount />
    </Suspense>
  );
}
