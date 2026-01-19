"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  post: {
    _id: string;
    content?: string;
    userId?: {
      name?: string;
      username?: string;
    };
  };
}

export default function ShareButton({ post }: ShareButtonProps) {
  const handleShare = async () => {
    // 🔒 HARD GUARD (prevents /undefined shares)
    if (!post?._id || !post.userId?.username) {
      console.error("Invalid post data for sharing", post);
      alert("Unable to share this post");
      return;
    }

    const url = `${window.location.origin}/${post.userId.username}/post/${post._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.userId.name || "Post",
          text: post.content || "Check out this post!",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("🔗 Post link copied!");
      }
    } catch (err) {
      console.log("Share cancelled or failed", err);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm d-flex align-items-center gap-1 mb-5"
      onClick={handleShare}
    >
      <Share2 size={24} />
    </button>
  );
}
