// src/app/(auth)/profile/[username]/page.tsx
import { Container, Row, Col } from "react-bootstrap";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import ProfileCardServer from "@/components/profile/ProfileCardServer";
import PostsFeed from "@/components/profile/PostsFeed";
import CreatePost from "@/components/profile/CreatePost";
import { auth } from "@/lib/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await connectDB();

  const { username } = await params;

  if (!username) {
    return <p className="text-center py-5">Invalid username</p>;
  }

  // 🔒 Case-insensitive username lookup
  const userDoc = await User.findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  }).lean();

  if (!userDoc) {
    return <p className="text-center py-5">User not found</p>;
  }

  const profile = {
    ...userDoc,
    id: userDoc._id.toString(),
    _id: userDoc._id.toString(),
  };

  const session = await auth();
  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4}>
          <ProfileCardServer profile={profile} />
        </Col>

        <Col lg={8}>
          {isOwnProfile && session && <CreatePost isOwnProfile />}
          <PostsFeed userId={profile.id} />
        </Col>
      </Row>
    </Container>
  );
}
