import { Suspense } from "react";
import AdminWithdrawalsClient from "./AdminWithdrawalsClient";

export const dynamic = "force-dynamic";

export default function AdminWithdrawalsPage() {
  return (
    <Suspense fallback={null}>
      <AdminWithdrawalsClient />
    </Suspense>
  );
}
