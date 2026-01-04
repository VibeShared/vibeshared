"use client";

import { useState } from "react";
import PostCard from "./PostCard";

interface PostCardWrapperProps {
  post: any;
  currentUserId: string;
}

export default function PostCardWrapper({ post, currentUserId }: PostCardWrapperProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const toggleComments = () => setIsCommentsOpen(!isCommentsOpen);

  const onDelete = () => {
    // Optionally handle post deletion here
    console.log("Delete post:", post._id);
  };

  return (
    <PostCard
      post={post}
      currentUserId={currentUserId}
      isCommentsOpen={isCommentsOpen}
      toggleComments={toggleComments}
      onDelete={onDelete}
    />
  );
}
