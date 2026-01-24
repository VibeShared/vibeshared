//src/components/comment/CommentModal.tsx
"use client";

import { Modal } from "react-bootstrap";
import CommentSection from "./CommentSection";

interface CommentModalProps {
  postId: string | null;
  currentUserId: string;
  onClose: () => void;
}

export default function CommentModal({
  postId,
  currentUserId,
  onClose,
}: CommentModalProps) {
  if (!postId) return null;

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Comments</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <CommentSection
          postId={postId}
          currentUserId={currentUserId}
        />
      </Modal.Body>
    </Modal>
  );
}
