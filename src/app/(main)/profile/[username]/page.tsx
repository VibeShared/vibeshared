// src/app/(auth)/profile/[username]/page.tsx
import { Container, Row, Col, Card } from "react-bootstrap";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { Follower } from "@/lib/models/Follower"; // Import Follower model
import ProfileCardServer from "@/components/profile/ProfileCardServer";
import PostsFeed from "@/components/profile/PostsFeed";
import CreatePost from "@/components/profile/CreatePost";
import { auth } from "@/lib/auth";
import { LockKeyhole } from 'lucide-react';
import BlockedUser from "@/lib/models/BlockedUser";



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
  
  // 1. Fetch the Profile User
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

  // 2. Get Current Session
  const session = await auth();
  const viewerId = session?.user?.id;
  const isOwnProfile = viewerId === profile.id;

  // 3. Check "Following" Status
  let isFollowing = false;
  if (viewerId && !isOwnProfile) {
    const followRecord = await Follower.findOne({
      follower: viewerId,
      following: profile.id,
      status: "approved", // Only allow if status is approved
    }).lean();
    
    if (followRecord) {
      isFollowing = true;
    }
  }

  // 4. Privacy Logic
  // If profile is NOT private, everyone can see.
  // If private, only Owner and Followers can see.
  const isPrivate = profile.isPrivate === true;
  const canViewFullProfile = !isPrivate || isOwnProfile || isFollowing;


  if (viewerId && !isOwnProfile) {
  const blocked = await BlockedUser.exists({
    $or: [
      { blocker: viewerId, blocked: profile.id },
      { blocker: profile.id, blocked: viewerId },
    ],
  });

  if (blocked) {
    return (
      <Container className="py-5 text-center">
        <h5>User not available</h5>
        <p className="text-muted">
          This profile is not accessible.
        </p>
      </Container>
    );
  }
}

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4}>
          {/* Profile Card is always visible (Name, Bio, Avatar) */}
          <ProfileCardServer profile={profile} />
        </Col>

        <Col lg={8}>
          {/* CREATE POST: Only for Owner */}
          {isOwnProfile && <CreatePost isOwnProfile />}

          {/* POSTS FEED: Check Privacy */}
          {canViewFullProfile ? (
            <PostsFeed userId={profile.id} />
          ) : (
            /* RESTRICTED VIEW UI */
            <Card className="text-center p-5 mt-3 border-0 shadow-sm">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "60px", height: "60px", border: "2px solid #333" }}
                >
                   <LockKeyhole size={24} />
                </div>
                <h5>This Account is Private</h5>
                <p className="text-muted">
                  Follow this account to see their photos and videos.
                </p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}