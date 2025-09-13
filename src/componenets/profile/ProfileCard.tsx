// app/components/ProfileCardServer.tsx
import ProfileCardClient from "@/componenets/ProfileCard/ProfilePersonal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProfileCardServer() {
  const session = await getServerSession(authOptions);

  return <ProfileCardClient  />;
}
