"use client";
import { Card, Tabs, Tab, Row, Col, Button, Badge } from "react-bootstrap";
import {
  Heart,
  Chat,
  Share,
  Bookmark,
  ThreeDots,
  Image,
  Camera,
  Calendar,
} from "react-bootstrap-icons";

interface Post {
  id: number;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  user: {
    name: string;
    username: string;
  };
}

interface PostsFeedProps {
  posts: Post[];
  userLocation?: string;
}

export default function PostsFeed({ posts, userLocation }: PostsFeedProps) {
  return (
    <Tabs defaultActiveKey="posts" className="mb-3">
      {/* ---- Posts Tab ---- */}
      <Tab eventKey="posts" title="Posts">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex">
                  <div
                    className="rounded-circle me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundImage: `url(https://i.pravatar.cc/50?u=${post.user.username})`,
                      backgroundSize: "cover",
                    }}
                  />
                  <div>
                    <div className="fw-semibold">{post.user.name}</div>
                    <div className="text-muted small">
                      @{post.user.username} · {post.timestamp}
                    </div>
                  </div>
                </div>
                <Button variant="light" size="sm">
                  <ThreeDots />
                </Button>
              </div>

              <p className="mb-3">{post.content}</p>

              <div className="d-flex justify-content-between">
                <Button variant="outline-secondary" size="sm">
                  <Heart className="me-1" />
                  {post.likes}
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <Chat className="me-1" />
                  {post.comments}
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <Share className="me-1" />
                  {post.shares}
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <Bookmark className="me-1" />
                  Save
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </Tab>

      {/* ---- Photos Tab ---- */}
      <Tab eventKey="photos" title="Photos">
        <Card className="shadow-sm">
          <Card.Body>
            <Row>
              {[...Array(9)].map((_, i) => (
                <Col xs={4} className="mb-3" key={i}>
                  <div
                    className="rounded"
                    style={{
                      height: "120px",
                      backgroundImage: `url(https://picsum.photos/300/200?random=${i})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Tab>

      {/* ---- About Tab ---- */}
      <Tab eventKey="about" title="About">
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Overview</h5>
            <Row className="mb-4">
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Work</div>
                <div>Software Engineer at TechCorp</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Education</div>
                <div>Computer Science at University</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Location</div>
                <div>{userLocation || "Not specified"}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Joined</div>
                <div>January 2023</div>
              </Col>
            </Row>

            <h5 className="mb-3">Skills</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {["React", "TypeScript", "Node.js", "UI/UX", "GraphQL"].map(
                (skill) => (
                  <Badge
                    bg="light"
                    text="dark"
                    key={skill}
                    className="px-3 py-2"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>

            <h5 className="mb-3">Interests</h5>
            <div className="d-flex flex-wrap gap-2">
              {["Technology", "Photography", "Travel", "Music", "Reading"].map(
                (interest) => (
                  <Badge bg="primary" key={interest} className="px-3 py-2">
                    {interest}
                  </Badge>
                )
              )}
            </div>
          </Card.Body>
        </Card>
      </Tab>
    </Tabs>
  );
}
