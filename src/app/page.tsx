"use client";

import { useEffect, useState, useRef } from "react";
import LikeButton from "@/componenets/Other/LikeButton";
import CommentSection from "@/componenets/Other/CommentSection";
import { useSession } from "next-auth/react";

export default function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";

  // ✅ Fetch posts with pagination
  async function fetchPosts() {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/post?page=${page}&limit=10`, {
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Failed to fetch posts");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fetch on page change
  useEffect(() => {
    fetchPosts();
  }, [page]);

  // ✅ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="container py-4">
        <div className="text-center text-muted">
          <i className="bi bi-inbox display-4 mb-3"></i>
          <p className="fs-5">
            No posts available. Follow some users or create your first post!
          </p>
        </div>
      </div>
    );
  }

  console.log(posts);
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="card p-3 mb-4 shadow-sm border-0 rounded-4"
            >
              {/* Header */}
              <div className="d-flex align-items-center mb-3">
                <img
                  src={post.userId?.image || "/default-avatar.png"}
                  alt={post.userId?.name || "Anonymous"}
                  width={48}
                  height={48}
                  className="rounded-circle border border-2 shadow-sm object-fit-cover"
                />
                <div className="ms-3">
                  <strong className="d-block">{post.userId?.name}</strong>
                  <small className="text-muted">
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>

              {/* Content */}
              <p className="mb-3">{post.content}</p>

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
                <span>{post.comments?.length ?? 0} comments</span>
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
                  Comment
                </button>
                <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center">
                  <i className="bi bi-share me-1"></i>
                  Share
                </button>
              </div>

              {/* Comments */}
              <CommentSection
                postId={post._id}
                initialComments={post.comments ?? []} // ✅ safe default
                currentUserId={session?.user?.id ?? ""}
              />
            </div>
          ))}

          {/* Infinite Scroll Loader */}
          <div ref={loaderRef} className="text-center py-3">
            {loading && <div className="spinner-border text-secondary" />}
          </div>

          {!hasMore && (
            <p className="text-center text-muted">You’ve reached the end 🎉</p>
          )}
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
