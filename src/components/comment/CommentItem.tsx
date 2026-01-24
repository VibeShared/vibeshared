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
  name?: string;
  username?: string;
  image?: string;
}

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  userId?: CommentUser | null;
  parentId?: string | null;
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

  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;

  /* ---------- SAFE USER FALLBACKS ---------- */
  const user = comment.userId;
  const username = user?.username ?? "#";
  const name = user?.name ?? "User";
  const avatar =
    imageError || !user?.image ? "/avatar.png" : user.image;

  const avatarSize = depth === 0 ? 32 : 24;

  /* ---------- Handlers ---------- */

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

  /* ---------- Deleted Comment View ---------- */
  if (comment.isDeleted) {
    return (
      <div
        className="py-2 text-muted fst-italic border rounded bg-light px-3 mb-2"
        style={{ fontSize: "0.85rem" }}
      >
        This comment has been deleted.
        {hasReplies && (
          <button
            className="btn btn-link btn-sm p-0 ms-2"
            onClick={() => setAreRepliesOpen((v) => !v)}
          >
            {areRepliesOpen ? "Hide" : "Show"} replies
          </button>
        )}

        {areRepliesOpen && hasReplies && (
          <div className="ms-4 mt-2">
            {replies.map((r) => (
              <MemoCommentItem
                key={r._id}
                comment={r}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Render ---------- */

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="d-flex flex-column"
    >
      <div className="d-flex gap-2 mb-2">
        <Link href={`/profile/${username}`} className="flex-shrink-0">
          <Image
            src={avatar}
            width={avatarSize}
            height={avatarSize}
            className="rounded-circle object-fit-cover"
            alt={name}
            onError={() => setImageError(true)}
          />
        </Link>

        <div className="flex-grow-1">
          {/* Header */}
          <div className="d-flex align-items-baseline gap-2">
            <Link
              href={`/profile/${username}`}
              className="fw-semibold text-dark text-decoration-none"
              style={{ fontSize: "0.9rem" }}
            >
              {name}
            </Link>
            <span className="text-muted small">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Body */}
          <p
            className="mb-1 text-break"
            style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}
          >
            {comment.text}
          </p>

          {/* Actions */}
          <div className="d-flex gap-3 align-items-center">
            <button
              className="btn btn-link p-0 text-muted text-decoration-none"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
              onClick={() => setIsReplying((v) => !v)}
            >
              Reply
            </button>

            {user?._id === currentUserId && (
              <button
                className="btn btn-link p-0 text-danger text-decoration-none"
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
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-2"
              >
                <div className="d-flex gap-2 align-items-start">
                  <textarea
                    rows={1}
                    className="form-control form-control-sm"
                    placeholder={`Replying to ${name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{ resize: "none", borderRadius: "12px" }}
                  />
                  <button
                    className="btn btn-sm btn-primary rounded-pill px-3"
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
        <div className="ms-4 ps-2">
          {!areRepliesOpen ? (
            <button
              className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-2 mb-2"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
              onClick={() => setAreRepliesOpen(true)}
            >
              <div
                style={{ width: "20px", height: "1px", background: "#ccc" }}
              />
              View {replies.length}{" "}
              {replies.length === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <div
              className="position-relative border-start ps-3"
              style={{ borderColor: "#e5e5e5" }}
            >
              {replies.map((reply) => (
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
                className="btn btn-link p-0 text-muted mt-1 text-decoration-none"
                style={{ fontSize: "0.75rem" }}
                onClick={() => setAreRepliesOpen(false)}
              >
                <Minus size={12} className="me-1" /> Hide replies
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export const MemoCommentItem = memo(CommentItem);
