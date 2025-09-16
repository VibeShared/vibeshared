"use client";

import CreatePost from "@/componenets/profile/CreatePost";
import PostsFeed from "@/componenets/profile/PostsFeed";




interface ProfilePageProps {
  params: {
    id: string;
  };
}




export default function InteractiveSection() {
  return (
    <>
       <CreatePost onPostCreate={() => {
        // Refresh posts or show success message
      }} />
      <PostsFeed  />
    </>
  );
}
