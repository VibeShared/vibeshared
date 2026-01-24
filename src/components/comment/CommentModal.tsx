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
    <Modal 
      show={!!postId} 
      onHide={onClose} 
      centered 
      size="lg"
      // Mobile par niche se upar aane wali feel ke liye (Drawer style)
      contentClassName="rounded-top-4 overflow-hidden border-0"
      className="p-0 p-md-default"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold h5">Comments</Modal.Title>
      </Modal.Header>

      <Modal.Body 
        style={{ 
          height: "80vh", // Thodi height badha di hai mobile view ke liye
          maxHeight: "80vh", 
          overflowY: "auto",
          WebkitOverflowScrolling: "touch" // Smooth scrolling for iOS
        }}
        className="pt-0"
      >
        <CommentSection
          postId={postId}
          currentUserId={currentUserId}
        />
      </Modal.Body>
    </Modal>
  );
}