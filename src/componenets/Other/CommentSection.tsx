"use client";

import { useState } from "react";
import type { PopulatedComment, Post } from "../../../types/types";
import { useEffect } from "react";

interface User {
  _id: string;
  name: string;
  image?: string;
}

interface Comment {
  _id: string;
  text: string;
  userId: User;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?postId=${postId}&limit=10`);
        const data = await res.json();
        if (res.ok) setComments(data.comments);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    }
    fetchComments();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!text.trim()) return;

    // ✅ Optimistic UI Update
    const optimisticComment: PopulatedComment = {
      _id: `temp-${Date.now()}`,
      text,
      userId: {
        _id: currentUserId,
        name: "You", // Replace with session user's name if available
      },
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

      const newComment: PopulatedComment = await res.json();

      // ✅ Replace optimistic comment with real one
      setComments((prev) =>
        prev.map((c) => (c._id === optimisticComment._id ? newComment : c))
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Rollback optimistic comment
      setComments((prev) =>
        prev.filter((c) => c._id !== optimisticComment._id)
      );
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId: currentUserId }),
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  }

  return (
    <div className="mt-3">
      <h6>Comments</h6>

      <form onSubmit={handleSubmit} className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : "Post"}
        </button>
      </form>

      {comments.map((comment) => (
        <div
          key={comment._id}
          className="border-bottom py-2 d-flex justify-content-between"
        >
          <span>
            <strong>{comment.userId?.name || "User"}</strong> {comment.text}
          </span>
          {comment.userId?._id === currentUserId && (
            <button
              onClick={() => handleDelete(comment._id)}
              className="btn btn-sm btn-link text-danger"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
