"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { pusherClient } from "@/lib/pusherClient";
import { MessageCircle, Trash2 } from "lucide-react"; // icon library
import { motion } from "framer-motion"

interface User {
  _id: string;
  name: string;
  image?: string;
}

export interface Comment {
  _id: string;
  text: string;
  userId: User;
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch comments with pagination
  async function fetchComments(newPage = 1) {
    try {
      const res = await fetch(`/api/comments?postId=${postId}&limit=5&page=${newPage}`);
      const data = await res.json();

      if (res.ok) {
        if (newPage === 1) {
          setComments(data.comments);
        } else {
          setComments((prev) => [...prev, ...data.comments]);
        }
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  // Optimistic update helper for adding a reply
  function addReplyToTree(comments: Comment[], parentId: string, reply: Comment): Comment[] {
    return comments.map((c) =>
      c._id === parentId
        ? { ...c, replies: [...(c.replies || []), reply] }
        : { ...c, replies: addReplyToTree(c.replies || [], parentId, reply) }
    );
  }

  function replaceReplyInTree(comments: Comment[], tempId: string, savedReply: Comment): Comment[] {
    return comments.map((c) => ({
      ...c,
      replies: c.replies
        ? c.replies.map((r) => (r._id === tempId ? savedReply : r))
        : [],
    }));
  }

  function removeCommentFromTree(comments: Comment[], commentId: string): Comment[] {
    return comments
      .filter((c) => c._id !== commentId)
      .map((c) => ({
        ...c,
        replies: removeCommentFromTree(c.replies || [], commentId),
      }));
  }

  // Post a top-level comment
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      text,
      userId: { _id: currentUserId, name: "You" },
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setText("");

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId, text }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const newComment = await res.json();
      setComments((prev) =>
        prev.map((c) => (c._id === optimisticComment._id ? newComment : c))
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      setComments((prev) => prev.filter((c) => c._id !== optimisticComment._id));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Post a reply
  async function handleReplySubmit(parentId: string) {
    if (!replyText.trim()) return;

    const optimisticReply: Comment = {
      _id: `temp-reply-${Date.now()}`,
      text: replyText,
      userId: { _id: currentUserId, name: "You" },
      createdAt: new Date().toISOString(),
      parentId,
    };

    setComments((prev) => addReplyToTree(prev, parentId, optimisticReply));
    setReplyText("");
    setReplyingTo(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: currentUserId,
          text: optimisticReply.text,
          parentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      const savedReply = await res.json();

      setComments((prev) =>
        replaceReplyInTree(prev, optimisticReply._id, savedReply)
      );
    } catch (err) {
      console.error("Failed to add reply", err);
      setComments((prev) => removeCommentFromTree(prev, optimisticReply._id));
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId: currentUserId }),
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      setComments((prev) => removeCommentFromTree(prev, commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  }

  // Real-time updates via Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`comments-${postId}`);

    channel.bind("new-comment", ({ comment }: { comment: Comment }) => {
      setComments((prev) =>
        comment.parentId
          ? addReplyToTree(prev, comment.parentId, comment)
          : [comment, ...prev]
      );
    });

    channel.bind("delete-comment", ({ commentId }: { commentId: string }) => {
      setComments((prev) => removeCommentFromTree(prev, commentId));
    });

    return () => {
      pusherClient.unsubscribe(`comments-${postId}`);
    };
  }, [postId]);

  return (
    <div className="mt-3">
      <h6 className="mb-3">Comments</h6>

      {/* Main Comment Form */}
      <form onSubmit={handleSubmit} className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
        />
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "..." : "Post"}
        </button>
      </form>

      {/* Render Comments */}
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          currentUserId={currentUserId}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          handleReplySubmit={handleReplySubmit}
          handleDelete={handleDelete}
        />
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={async () => {
              setLoadingMore(true);
              await fetchComments(page + 1);
              setPage((prev) => prev + 1);
              setLoadingMore(false);
            }}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

// Recursive CommentItem Component
function CommentItem({
  comment,
  currentUserId,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleReplySubmit,
  handleDelete,
}: {
  comment: Comment;
  currentUserId: string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (val: string) => void;
  handleReplySubmit: (parentId: string) => void;
  handleDelete: (commentId: string) => void;
}) {
  return (
    <motion.div
      className="mb-3 ms-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="d-flex align-items-start">
        {/* Avatar */}
        <img
          src={comment.userId.image || "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"}
          alt={comment.userId.name}
          className="rounded-circle border shadow-sm me-2"
          style={{ width: "36px", height: "36px", objectFit: "cover" }}
        />

        <div className="flex-grow-1">
          {/* Comment bubble */}
          <div className="bg-white border rounded-3 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
              <strong className="text-dark">{comment.userId.name}</strong>
              <small className="text-muted">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </small>
            </div>
            <p className="mb-1 mt-1 text-dark">{comment.text}</p>

            {/* Actions */}
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-link btn-sm text-muted p-0 d-flex align-items-center gap-1"
                onClick={() =>
                  setReplyingTo(replyingTo === comment._id ? null : comment._id)
                }
              >
                <MessageCircle size={16} /> Reply
              </button>

              {comment.userId._id === currentUserId && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="btn btn-link btn-sm text-danger p-0 d-flex align-items-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Reply input */}
          {replyingTo === comment._id && (
            <div className="mt-2">
              <input
                type="text"
                className="form-control form-control-sm mb-2"
                placeholder={`Reply to ${comment.userId.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleReplySubmit(comment._id)}
              >
                Reply
              </button>
            </div>
          )}

          {/* Nested replies with connector line */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ms-4 mt-3 ps-3 border-start">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUserId={currentUserId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleReplySubmit={handleReplySubmit}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
