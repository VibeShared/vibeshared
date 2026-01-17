import PrivacyForm from "./PrivacyForm";
import FollowRequests from "./FollowRequests";
import { Suspense } from "react";



export const dynamic = "force-dynamic";


export default function PrivacyPage() {
  return (
    <>
     <Suspense fallback={null}>

      <PrivacyForm />
      <FollowRequests />
     </Suspense>
    </>
  );
}
