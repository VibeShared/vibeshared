import { Metadata } from "next";
import { Post } from "@/types/types";
import UserPostsList from "@/components/Post component/UserPostsList";
// ✅ Import auth from your root config
import { auth } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Post by user ${id}`,
    description: `View the latest posts from user ${id}`,
  };
}

async function getPostsByUser(userId: string) {
  // Industry Standard: Use absolute URLs for server-side fetches
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/user/${userId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error("Failed to fetch:", res.status);
    return null;
  }

  return res.json();
}

export default async function UserPostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ✅ Auth.js v5: Simplified session fetching
  const session = await auth();
  
  // We can initiate data fetching in parallel with session logic if needed
  const data = await getPostsByUser(id);
  const currentUserId = session?.user?.id ?? "";

  if (!data || !data.posts || data.posts.length === 0) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <p className="text-muted fs-5">No posts found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <UserPostsList posts={data.posts} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}