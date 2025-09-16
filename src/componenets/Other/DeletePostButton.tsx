"use client";

import { useState } from "react";

export default function DeletePostButton({ postId, currentUserId, postOwnerId }: {
  postId: string;
  currentUserId: string;
  postOwnerId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/post/${postId}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete post");

      alert("Post deleted successfully ✅");
      window.location.reload(); // refresh page to update list
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post ❌");
    } finally {
      setLoading(false);
    }
  }

  if (currentUserId !== postOwnerId) return null; // hide if not owner

  return (
    <button
      onClick={handleDelete}
      className="btn btn-sm btn-outline-danger rounded-pill ms-2"
      disabled={loading}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
