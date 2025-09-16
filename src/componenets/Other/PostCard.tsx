"use client";

import { Card, Image, Button } from "react-bootstrap";
import { HandThumbsUp, Chat } from "react-bootstrap-icons";

export default function PostCard({ post }: { post: any }) {
  return (
    <Card className="mb-3 shadow-sm rounded-4">
      <Card.Body>
        {/* --- Header --- */}
        <div className="d-flex align-items-center mb-2">
          <Image
            src={post.userId?.image || "/default-avatar.png"}
            roundedCircle
            width={40}
            height={40}
            className="me-2"
            alt={post.userId?.username || "User"}
          />
          <div>
            <strong>{post.userId?.username || post.userId?.name}</strong>
            <div className="text-muted small">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* --- Content --- */}
        {post.content && <p className="mb-2">{post.content}</p>}

        {/* --- Media --- */}
        {post.mediaUrl && (
          post.mediaUrl.endsWith(".mp4") ? (
            <video src={post.mediaUrl} controls className="w-100 rounded mb-2" />
          ) : (
            <Image src={post.mediaUrl} alt="Post media" fluid className="rounded mb-2" />
          )
        )}

        {/* --- Actions --- */}
        <div className="d-flex justify-content-between mt-2">
          <Button variant="light" size="sm" className="rounded-pill">
            <HandThumbsUp className="me-1" /> {post.likes?.length || 0}
          </Button>
          <Button variant="light" size="sm" className="rounded-pill">
            <Chat className="me-1" /> {post.comments?.length || 0}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
