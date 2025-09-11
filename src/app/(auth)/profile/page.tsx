"use client";
import { Container, Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";

// Components
import ProfileCard from "@/componenets/profile/ProfileCard";
import FriendsList from "@/componenets/profile/FriendsList";
import CreatePost from "@/componenets/profile/CreatePost";
import PostsFeed from "@/componenets/profile/PostsFeed";

// Mock Data (can move to /data folder later)
const mockFriends = [
  { id: 1, name: "Jane Doe", username: "jane", mutual: 12 },
  { id: 2, name: "Sam Smith", username: "sam", mutual: 5 },
  { id: 3, name: "Emma Brown", username: "emma", mutual: 8 },
];

const mockPosts = [
  {
    id: 1,
    content: "Just finished a new project! 🚀",
    likes: 34,
    comments: 12,
    shares: 5,
    timestamp: "2h",
    user: { name: "John Doe", username: "johndoe" },
  },
  {
    id: 2,
    content: "Loving the new React features ❤️",
    likes: 50,
    comments: 20,
    shares: 8,
    timestamp: "5h",
    user: { name: "John Doe", username: "johndoe" },
  },
];

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <Container className="py-4">
      <Row>
        {/* Sidebar (Profile + Friends) */}
        <Col lg={4} className="mb-4">
          <div className="sticky-sidebar">
            <ProfileCard session={session} />
            <div className="mt-4">
              <FriendsList friends={mockFriends} />
            </div>
          </div>
        </Col>

        {/* Main Content */}
        <Col lg={8}>
          <CreatePost
            onPostCreate={(content) =>
              console.log("New post created:", content)
            }
          />
          <PostsFeed posts={mockPosts} />
        </Col>
      </Row>
    </Container>
  );
}
