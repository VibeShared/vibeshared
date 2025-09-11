"use client";
import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { Image, Camera, Calendar } from "react-bootstrap-icons";

interface CreatePostProps {
  onPostCreate?: (content: string) => void; // callback for new post
}

export default function CreatePost({ onPostCreate }: CreatePostProps) {
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState("");

  const handleSubmit = () => {
    if (postContent.trim()) {
      onPostCreate?.(postContent);
      setPostContent("");
      setShowModal(false);
    }
  };

  return (
    <>
      {/* ---- Create Post Card ---- */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex">
            <div
              className="rounded-circle me-3"
              style={{
                width: "50px",
                height: "50px",
                backgroundImage: "url(https://i.pravatar.cc/50)",
                backgroundSize: "cover",
              }}
            />
            <Button
              variant="light"
              className="flex-grow-1 text-start"
              onClick={() => setShowModal(true)}
            >
              What's on your mind?
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ---- Create Post Modal ---- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </Form.Group>
            <Row className="mt-3">
              <Col>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <Image /> Photo/Video
                </Button>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <Camera /> Live Video
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <Calendar /> Event
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!postContent.trim()}
          >
            Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
