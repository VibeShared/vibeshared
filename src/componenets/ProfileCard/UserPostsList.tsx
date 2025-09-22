"use client";

import { useState } from "react";
import PostCard from "@/componenets/ProfileCard/PostCard";
import { Post } from "@/types/types";

interface UserPostsListProps {
  posts: Post[];
  currentUserId: string;
}

export default function UserPostsList({ posts, currentUserId }: UserPostsListProps) {
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          isCommentsOpen={openPostId === post._id}
          toggleComments={() =>
            setOpenPostId(openPostId === post._id ? null : post._id)
          }
          onDelete={(id) => console.log("Deleted:", id)}
        />
      ))}
    </>
  );
}
