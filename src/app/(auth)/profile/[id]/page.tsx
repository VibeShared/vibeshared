// ProfilePage.tsx (SERVER component)
import { Container, Row, Col } from "react-bootstrap";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FriendsList from "@/componenets/profile/FriendsList";
import ProfileCardServer from "@/componenets/profile/ProfileCard";
import InteractiveSection from "@/componenets/ProfileCard/InteractiveSection"; // ✅ new client wrapper

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);


  // Mock Data
const mockFriends = [
  { id: 1, name: "Jane Doe", username: "jane", mutual: 12 },
  { id: 2, name: "Sam Smith", username: "sam", mutual: 5 },
  { id: 3, name: "Emma Brown", username: "emma", mutual: 8 },
];




  return (
    <Container className="py-4">
      <Row>
        <Col lg={4} className="mb-4">
          <div className="sticky-sidebar">
            <ProfileCardServer  />
            <div className="mt-4">
              <FriendsList friends={mockFriends} />
            </div>
          </div>
        </Col>
        <Col lg={8}>
          <InteractiveSection /> {/* ✅ Client component */}
        </Col>
      </Row>
    </Container>
  );
}
