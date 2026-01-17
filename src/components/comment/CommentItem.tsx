// src/components/comment/CommentItem.tsx
import { memo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CommentItemProps {
  comment: any;
  currentUserId: string;
  onReply: (text: string, parentId?: string) => void;
  onDelete: (commentId: string) => void;
}




function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: CommentItemProps) {
  // ✅ Local state to handle replying
  const profileSlug = comment.userId?.username || ""
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText, comment._id);
    setIsReplying(false);
    setReplyText("");
  };

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="d-flex gap-2 mb-3">
     <Link
  href={`/profile/${profileSlug}`}
  className="d-flex align-items-start text-decoration-none"
>
  <img
    src={comment.userId?.image || "/default-avatar.png"}
    className="rounded-circle"
    width={36}
    height={36}
    alt={comment.userId?.name || "User"}
  />
</Link>


        <div className="flex-grow-1">
          <div className="bg-light p-2 rounded">
  <div className="d-flex align-items-center gap-2">
    <Link
      href={`/profile/${profileSlug}`}
      className="fw-semibold text-dark text-decoration-none hover-underline"
    >
      {comment.userId?.name || "User"}
    </Link>

    <small className="text-muted">
      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
    </small>
  </div>

  <p className="mb-1 mt-1">{comment.text}</p>
</div>


          <div className="d-flex gap-3 mt-1 ms-1">
            {/* ✅ Toggle Reply Mode instead of sending empty string */}
            <button 
              className="btn btn-link p-0 text-decoration-none text-muted"
              style={{ fontSize: "0.85rem" }}
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle size={14} className="me-1" /> Reply
            </button>

            {comment.userId._id === currentUserId && (
              <button 
                className="btn btn-link p-0 text-decoration-none text-danger"
                style={{ fontSize: "0.85rem" }}
                onClick={() => onDelete(comment._id)}
              >
                <Trash2 size={14} className="me-1" /> Delete
              </button>
            )}
          </div>

          {/* ✅ Render Reply Input if isReplying is true */}
          {isReplying && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 d-flex gap-2"
            >
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={handleSendReply}>
                <Send size={14} />
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => setIsReplying(false)}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          {/* Nested Replies */}
          <div className="ms-4 mt-2 border-start ps-3">
            {comment.replies?.map((r: any) => (
              <MemoCommentItem
                key={r._id}
                comment={r}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const MemoCommentItem = memo(CommentItem);