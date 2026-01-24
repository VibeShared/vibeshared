import { memo, useState, KeyboardEvent, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Minus, Edit2, Trash2, Reply } from "lucide-react";
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
  isEdited?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply: (text: string, parentId: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, newText: string) => void; // Added Missing Prop
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
  onEdit,
  depth = 0,
}: CommentItemProps) {
  if (depth > MAX_DEPTH) return null;

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [areRepliesOpen, setAreRepliesOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;

  // Sync edit text if comment changes externally
  useEffect(() => {
    setEditText(comment.text);
  }, [comment.text]);

  const user = comment.userId;
  const username = user?.username ?? "#";
  const name = user?.name ?? "User";
  const avatar = imageError || !user?.image ? "/avatar.png" : user.image;
  const avatarSize = depth === 0 ? 32 : 24;

  /* ---------- Handlers ---------- */

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    if (editText.trim() === comment.text) {
      setIsEditing(false);
      return;
    }
    onEdit(comment._id, editText.trim());
    setIsEditing(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim(), comment._id);
    setReplyText("");
    setIsReplying(false);
    setAreRepliesOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, type: 'reply' | 'edit') => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      type === 'reply' ? handleSendReply() : handleSaveEdit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setIsReplying(false);
    }
  };

  /* ---------- Deleted Comment View ---------- */
  if (comment.isDeleted) {
    return (
      <div className="py-2 text-muted fst-italic border-start ps-3 mb-2" style={{ fontSize: "0.85rem" }}>
        This comment has been deleted.
        {hasReplies && (
          <button className="btn btn-link btn-sm p-0 ms-2 text-decoration-none" onClick={() => setAreRepliesOpen((v) => !v)}>
            {areRepliesOpen ? "Hide" : "Show"} replies
          </button>
        )}
        {areRepliesOpen && hasReplies && (
          <div className="mt-2">
            {replies.map((r) => (
              <MemoCommentItem key={r._id} comment={r} currentUserId={currentUserId} onReply={onReply} onDelete={onDelete} onEdit={onEdit} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex flex-column mb-3">
      <div className="d-flex gap-2">
        {/* Avatar */}
        <Link href={`/profile/${username}`} className="flex-shrink-0">
          <Image src={avatar} width={avatarSize} height={avatarSize} className="rounded-circle object-fit-cover shadow-sm" alt={name} onError={() => setImageError(true)} />
        </Link>

        <div className="flex-grow-1">
          {/* Header */}
          <div className="d-flex align-items-baseline gap-2 mb-1">
            <Link href={`/profile/${username}`} className="fw-bold text-dark text-decoration-none" style={{ fontSize: "0.85rem" }}>
              {name}
            </Link>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && <span className="text-muted italic" style={{ fontSize: "0.7rem" }}>(edited)</span>}
          </div>

          {/* Comment Content / Edit Mode */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                className="form-control form-control-sm border-primary"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'edit')}
                style={{ resize: "none", borderRadius: "8px", fontSize: "0.9rem" }}
                autoFocus
              />
              <div className="d-flex gap-2 mt-1">
                <button className="btn btn-sm btn-primary py-0 px-2" style={{ fontSize: "0.75rem" }} onClick={handleSaveEdit}>Save</button>
                <button className="btn btn-sm btn-light py-0 px-2" style={{ fontSize: "0.75rem" }} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="mb-1 text-break" style={{ fontSize: "0.9rem", color: "#333", whiteSpace: "pre-wrap" }}>
              {comment.text}
            </p>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-3 align-items-center mb-1">
            <button className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", fontWeight: 600 }} onClick={() => setIsReplying((v) => !v)}>
              <Reply size={12} /> Reply
            </button>

            {user?._id === currentUserId && !isEditing && (
              <>
                <button className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }} onClick={() => setIsEditing(true)}>
                  <Edit2 size={12} /> Edit
                </button>
                <button className="btn btn-link p-0 text-danger text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }} onClick={() => onDelete(comment._id)}>
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Input Box */}
          <AnimatePresence>
            {isReplying && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
                <div className="d-flex gap-2 align-items-start">
                  <textarea
                    rows={1}
                    className="form-control form-control-sm shadow-sm"
                    placeholder={`Reply to ${name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'reply')}
                    autoFocus
                    style={{ resize: "none", borderRadius: "10px", fontSize: "0.85rem" }}
                  />
                  <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" disabled={!replyText.trim()} onClick={handleSendReply}>Post</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested Replies Section */}
      {hasReplies && (
        <div className="ms-4 ps-2 border-start" style={{ borderColor: "#eee" }}>
          {!areRepliesOpen ? (
            <button className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-2 mt-1 mb-2" style={{ fontSize: "0.75rem", fontWeight: 700 }} onClick={() => setAreRepliesOpen(true)}>
              <div style={{ width: "15px", height: "1.5px", background: "#ddd" }} />
              View {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <div className="pt-2">
              {replies.map((reply) => (
                <MemoCommentItem key={reply._id} comment={reply} currentUserId={currentUserId} onReply={onReply} onDelete={onDelete} onEdit={onEdit} depth={depth + 1} />
              ))}
              <button className="btn btn-link p-0 text-muted text-decoration-none" style={{ fontSize: "0.7rem" }} onClick={() => setAreRepliesOpen(false)}>
                <Minus size={10} className="me-1" /> Hide
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export const MemoCommentItem = memo(CommentItem);