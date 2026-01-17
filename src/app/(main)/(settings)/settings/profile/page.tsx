import ProfileForm from "./ProfileForm";
import { Suspense } from "react";
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  );
}
