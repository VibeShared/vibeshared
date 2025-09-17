// app/post/[id]/page.tsx

import LikeButton from "@/componenets/Other/LikeButton";
import CommentSection from "@/componenets/Other/CommentSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import "@/styles/componenet/profile/post/post.module.css";
import DeletePostButton from "@/componenets/Other/DeletePostButton";

interface Comment {
  _id: string;
  text: string;
  userId: { name: string; image?: string };
}

interface Post {
  _id: string;
  content: string;
  mediaUrl?: string;
  userId: { name: string; image?: string };
  likesCount: number;
  comments: Comment[];
}

async function getPostsByUser(userId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/user/${userId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch:", res.status);
    return null;
  }

  return res.json();
}

export default async function UserPostsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const data = await getPostsByUser(params.id);
  const currentUserId = session.user.id;

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
          {data.posts.map((post: any) => (
            <div
              key={post._id}
              className="card p-3 mb-4 shadow-sm border-0 rounded-4"
            >
              {/* Post Header */}
              <div className="d-flex align-items-center mb-3">
                <div className="position-relative">
                  <img
                    src={post.userId?.image || "/default-avatar.png"}
                    alt={post.userId?.name || "Unknown"}
                    width={48}
                    height={48}
                    className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
                  />
                  <span className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-2 border-white"></span>
                </div>
                <div className="ms-3">
                  <strong className="d-block text-dark">
                    {post.userId?.name || "Anonymous"}
                  </strong>
                  <small className="text-muted">Posted recently</small>
                </div>
                <span className="btn btn-link text-muted ms-auto p-0">
                  <i className="bi bi-three-dots"></i>
                  <DeletePostButton
                    postId={post._id}
                    currentUserId={currentUserId}
                    postOwnerId={post.userId._id}
                  />
                </span>
              </div>

              {/* Post Content */}
              <p className="mb-3 fs-6 lh-base text-dark">{post.content}</p>

              {/* Media */}
              {post.mediaUrl && (
                <div className="mb-3 rounded-3 overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    className="img-fluid w-100 rounded-3"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>{post.likesCount} likes</span>
                <span>{post.comments.length} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between border-top border-bottom py-2 mb-3">
                <LikeButton
                  postId={post._id}
                  initialCount={post.likesCount}
                  currentUserId={currentUserId}
                />
                <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center">
                  <i className="bi bi-chat me-1"></i>
                  <span>Comment</span>
                </button>
                <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center">
                  <i className="bi bi-share me-1"></i>
                  <span>Share</span>
                </button>
              </div>

              {/* Comment Section */}
              <CommentSection
                postId={post._id}
                initialComments={post.comments ?? []}
                currentUserId={session?.user?.id ?? ""}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add Bootstrap Icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />
    </div>
  );
}
