// src/components/profile/ProfileCard.tsx
import ProfileCardClient from "@/components/profile/ProfileCard";
// ✅ Import auth from your root config
import { auth } from "@/lib/auth";

interface ProfileCardServerProps {
  profile: any; // Ideally, use your User type here
}

export default async function ProfileCardServer({ profile }: ProfileCardServerProps) {
  // ✅ Auth.js v5: Get the current session
  const session = await auth();

  // Compute whether this is the logged-in user’s profile
  // session.user.id is already typed as a string from our d.ts file
  const isOwnProfile = !!(session?.user?.id && session.user.id === profile.id);

  return <ProfileCardClient user={profile} isOwnProfile={isOwnProfile} />;
}