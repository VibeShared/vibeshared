"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  post: {
    _id: string;
    content?: string;
    userId?: { name?: string };
  };
}

export default function ShareButton({ post }: ShareButtonProps) {
  const handleShare = () => {
   const url = `${window.location.origin}/post/single/${post._id}`;

    if (navigator.share) {
      navigator.share({
        title: post.userId?.name || "Post",
        text: post.content || "Check out this post!",
        url,
      }).catch(err => console.log("Share cancelled", err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("🔗 Post link copied!");
      });
    }
  };

  return (
    <button className="btn btn-sm d-flex align-items-center gap-1 mb-5" onClick={handleShare}>
      <Share2 size={24} />
      
    </button>
  );
}
