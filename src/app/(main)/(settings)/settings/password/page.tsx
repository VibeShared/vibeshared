// app/(main)/(settings)/settings/password/page.tsx
import { Suspense } from "react";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default function PasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordForm />
    </Suspense>
  );
}
