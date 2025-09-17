//src\componenets\profile\ProfileCard.tsx
import ProfileCardClient from "@/componenets/ProfileCard/ProfilePersonal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface ProfileCardServerProps {
  profile: any;
 
}

export default async function ProfileCardServer({ profile,  }: ProfileCardServerProps) {
  const session = await getServerSession(authOptions);

  // Compute whether this is the logged-in user’s profile
  const isOwnProfile =
    session?.user?.id?.toString() === profile._id?.toString();

  return <ProfileCardClient user={profile} isOwnProfile={isOwnProfile} />;
}

