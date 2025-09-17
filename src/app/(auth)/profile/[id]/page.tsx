// src/app/(auth)/profile/[id]/page.tsx
import { Container, Row, Col } from "react-bootstrap";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/Connect";
import ProfileCardServer from "@/componenets/profile/ProfileCard";
import mongoose from "mongoose";
import PostsFeed from "@/componenets/profile/PostsFeed";
import CreatePost from "@/componenets/profile/CreatePost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connectDB();

  // ✅ Await params (Next.js 15 requirement)
  const { id } = await params;

  // Validate ID early
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return <p>Invalid user ID</p>;
  }

  // Fetch user
  const userDoc = await User.findById(id).lean();
  if (!userDoc) {
    return <p>User not found</p>;
  }

  // Build a plain JS object and ensure `id` exists
  const plainProfile: any = JSON.parse(JSON.stringify(userDoc));
  plainProfile.id = plainProfile._id?.toString();

  // Get session and check ownership
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === plainProfile.id;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4}>
          <ProfileCardServer profile={plainProfile} />
        </Col>

        <Col lg={8}>
          {isOwnProfile && <CreatePost isOwnProfile={true} />}
          <PostsFeed userId={plainProfile.id} />
        </Col>
      </Row>
    </Container>
  );
}
