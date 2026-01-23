// src/components/comment/CommentItem.tsx
import { memo, useState, KeyboardEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface CommentUser {
  _id: string;
  name: string;
  username: string;
  image?: string;
}

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  userId: CommentUser;
  replies?: Comment[];
  isDeleted?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply: (text: string, parentId: string) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_DEPTH = 3;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  if (depth > MAX_DEPTH) return null;

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [areRepliesOpen, setAreRepliesOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasReplies = Boolean(comment.replies?.length);
  const avatarSize = depth === 0 ? 32 : 28;

  /* ----------------------------- */
  /* Soft Deleted State            */
  /* ----------------------------- */

  if (comment.isDeleted) {
    return (
      <div
        className="ms-5 text-muted fst-italic"
        style={{ fontSize: "0.85rem" }}
        role="status"
      >
        This comment was deleted
      </div>
    );
  }

  /* ----------------------------- */
  /* Handlers                      */
  /* ----------------------------- */

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim(), comment._id);
    setReplyText("");
    setIsReplying(false);
    setAreRepliesOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  /* ----------------------------- */
  /* Render                        */
  /* ----------------------------- */

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="d-flex gap-2 mb-2">
        <Link
          href={`/profile/${comment.userId.username}`}
          className="flex-shrink-0"
          aria-label={`Visit ${comment.userId.name}'s profile`}
        >
          <Image
            src={
              imageError || !comment.userId.image
                ? "/default-avatar.png"
                : comment.userId.image
            }
            width={avatarSize}
            height={avatarSize}
            className="rounded-circle"
            alt={`${comment.userId.name}'s avatar`}
            onError={() => setImageError(true)}
          />
        </Link>

        <div className="flex-grow-1">
          {/* Header */}
          <div className="d-flex align-items-baseline gap-2">
            <Link
              href={`/profile/${comment.userId.username}`}
              className="fw-semibold text-dark text-decoration-none"
            >
              {comment.userId.name}
            </Link>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Body */}
          <p className="mb-1" style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
            {comment.text}
          </p>

          {/* Actions */}
          <div className="d-flex gap-3">
            <button
              className="btn btn-link p-0 text-muted"
              style={{ fontSize: "0.8rem" }}
              onClick={() => setIsReplying((v) => !v)}
              aria-expanded={isReplying}
            >
              Reply
            </button>

            {comment.userId._id === currentUserId && (
              <button
                className="btn btn-link p-0 text-danger"
                style={{ fontSize: "0.8rem" }}
                onClick={() => onDelete(comment._id)}
              >
                Delete
              </button>
            )}
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="d-flex gap-2">
                  <textarea
                    rows={1}
                    className="form-control form-control-sm rounded-pill"
                    placeholder={`Reply to ${comment.userId.name}`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <button
                    className="btn btn-link text-primary"
                    disabled={!replyText.trim()}
                    onClick={handleSendReply}
                  >
                    Post
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="ms-5">
          {!areRepliesOpen ? (
            <button
              className="btn btn-link p-0 text-muted fw-semibold"
              style={{ fontSize: "0.8rem" }}
              onClick={() => setAreRepliesOpen(true)}
            >
              View {comment.replies!.length}{" "}
              {comment.replies!.length === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <div className="position-relative">
              <div
                className="position-absolute border-start"
                style={{
                  left: "-16px",
                  top: 0,
                  bottom: 0,
                  borderColor: "#e5e5e5",
                }}
                aria-hidden="true"
              />

              {comment.replies!.map((reply) => (
                <MemoCommentItem
                  key={reply._id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}

              <button
                className="btn btn-link p-0 text-muted mt-1"
                style={{ fontSize: "0.8rem" }}
                onClick={() => setAreRepliesOpen(false)}
              >
                <Minus size={12} className="me-1" />
                Hide replies
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export const MemoCommentItem = memo(CommentItem);
