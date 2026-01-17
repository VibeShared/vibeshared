"use client";

import { useState } from "react";
import PostCard from "@/components/post/PostCard";
import { Post } from "@/types/types";
import CommentModal from "@/components/comment/CommentModal";

interface UserPostsListProps {
  posts: Post[];
  currentUserId: string;
}

export default function UserPostsList({
  posts,
  currentUserId,
}: UserPostsListProps) {
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  return (
    <>
      {posts.map((post) => {
        const postId = post._id ?? post.id;

        if (!postId) return null; // 🔥 HARD GUARD

        return (
          <PostCard
            key={postId}
            post={post}
            currentUserId={currentUserId}
            onOpenComments={(postId) => setActivePostId(postId)}
            onDelete={(id) => console.log("Deleted:", id)}
            onBlockUser={(id) => console.log("Blocked:", id)}
          />
        );
      })}
      
            <CommentModal
        postId={activePostId}
        currentUserId={currentUserId}
        onClose={() => setActivePostId(null)}
      />
      
    </>
  );
}
