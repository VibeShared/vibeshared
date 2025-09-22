import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import { Metadata } from "next";
import { Post } from "@/types/types";
import UserPostsList from "@/componenets/ProfileCard/UserPostsList";

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
  const session = await getServerSession(authOptions);
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
