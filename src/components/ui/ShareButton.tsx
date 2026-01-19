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

export default function ShareButton({ post }: { post: any }) {
  const handleShare = async () => {
    if (!post?._id || !post.userId?.username) return;

    const url = `${window.location.origin}/${post.userId.username}/post/${post._id}`;

    if (navigator.share) {
      await navigator.share({
        title: post.userId.name,
        text: post.content || "",
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  };

  return (
    <button className="btn btn-sm mb-5" onClick={handleShare}>
      <Share2 size={24} />
    </button>
  );
}
