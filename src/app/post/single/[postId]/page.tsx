import PostCardWrapper from "@/components/Post component/PostCardWrapper";
// ✅ Import auth from your root config
import { auth } from "@/lib/auth";
import { Metadata } from "next";

async function getPost(postId: string) {
  // Use public base URL or Internal URL for server-side fetch
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post/${postId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// ✅ Next.js 15 requires params to be treated as a Promise
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ postId: string }> 
}): Promise<Metadata> {
  const { postId } = await params;
  const data = await getPost(postId);

  if (!data) {
    return {
      title: "Post not found",
      description: "This post might have been deleted.",
    };
  }

  return {
    title: `${data.userId?.name ?? "User"}'s Post`,
    description: data.content || "Check out this post on VibeShared!",
    openGraph: {
      title: `${data.userId?.name ?? "User"}'s Post`,
      description: data.content || "Check out this post on VibeShared!",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/single/${postId}`,
      type: "article",
      images: data.mediaUrl ? [{
          url: data.mediaUrl,
          width: 800,
          height: 600,
          alt: "Post image",
      }] : [],
    },
  };
}

export default async function SinglePostPage({ 
  params 
}: { 
  params: Promise<{ postId: string }> 
}) {
  const { postId } = await params;

  // ✅ Trigger data and auth in parallel for better performance
  const postDataPromise = getPost(postId);
  const sessionPromise = auth();

  const [data, session] = await Promise.all([postDataPromise, sessionPromise]);
  
  const currentUserId = session?.user?.id ?? "";

  if (!data) {
    return (
      <div className="container py-4 text-center">
        <p className="text-muted fs-5">Post not found</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <PostCardWrapper post={data} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}