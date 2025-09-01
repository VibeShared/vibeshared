"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();

  if (session) {
    console.log(session)
    return (
      <>
        
        <button className="btn btn-primary" onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      <button className="btn btn-primary" onClick={() => signIn()}>Sign in</button>
    </>
  );
}
