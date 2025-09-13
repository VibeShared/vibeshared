"use client";

import CreatePost from "@/componenets/profile/CreatePost";
import PostsFeed from "@/componenets/profile/PostsFeed";


const mockPosts = [
  {
    id: 1,
    content: "Just finished a new project! 🚀",
    likes: 34,
    comments: 12,
    shares: 5,
    timestamp: "2h",
    user: { name: "John Doe", username: "johndoe" },
  },
  {
    id: 2,
    content: "Loving the new React features ❤️",
    likes: 50,
    comments: 20,
    shares: 8,
    timestamp: "5h",
    user: { name: "John Doe", username: "johndoe" },
  },
];

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function InteractiveSection() {
  return (
    <>
      <CreatePost
        onPostCreate={(content) => console.log("New post created:", content)}
      />
      <PostsFeed posts={mockPosts} />
    </>
  );
}
