"use client";
import { Card, Row, Col, Button, Badge } from "react-bootstrap";

interface Friend {
  id: number;
  name: string;
  username: string;
  mutual: number;
}

interface FriendsListProps {
  friends: Friend[];
}

export default function FriendsList({ friends }: FriendsListProps) {
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Friends</h5>
        <Badge bg="light" text="dark">{friends.length}</Badge>
      </Card.Header>
      <Card.Body>
        <Row>
          {friends.map((friend) => (
            <Col xs={6} key={friend.id} className="mb-3">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle me-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundImage: `url(https://i.pravatar.cc/40?u=${friend.id})`,
                    backgroundSize: "cover",
                  }}
                />
                <div className="overflow-hidden">
                  <div className="fw-semibold text-truncate">{friend.name}</div>
                  <small className="text-muted">
                    {friend.mutual} mutual friends
                  </small>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Button variant="outline-primary" className="w-100 mt-2">
          See all friends
        </Button>
      </Card.Body>
    </Card>
  );
}
