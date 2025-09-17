"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import LikeButton from "@/componenets/Other/LikeButton";
import CommentSection from "@/componenets/Other/CommentSection";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";
  const isInitialMount = useRef(true);

  // ✅ Memoized fetch function without loading dependency
  const fetchPosts = useCallback(async () => {
    if (!hasMore) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/post?page=${page}&limit=10`);

      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      setPosts((prev) => {
        const newUniquePosts = data.posts.filter(
          (newPost: any) => !prev.some((p) => p._id === newPost._id)
        );
        return [...prev, ...newUniquePosts];
      });

      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  // ✅ Fetch on page change
  useEffect(() => {
    // Skip initial mount to prevent double fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    fetchPosts();
  }, [fetchPosts]);

  // ✅ Initial data fetch
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, []);

  // ✅ Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // ✅ Retry function for error state
  const retryFetch = () => {
    setError(null);
    fetchPosts();
  };

  if (error) {
    return (
      <div className="container py-4">
        <div className="text-center text-muted">
          <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
          <h4 className="text-dark">Unable to load posts</h4>
          <p className="fs-5 mb-3">{error}</p>
          <button 
            onClick={retryFetch}
            className="btn btn-primary rounded-pill px-4"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                <Link
                  href={`/profile/${post.userId?._id ?? ""}`}
                  className="d-flex align-items-center text-decoration-none"
                >
                  <img
                    src={post.userId?.image || "/default-avatar.png"}
                    alt={post.userId?.name || "Unknown"}
                    width={48}
                    height={48}
                    className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
                  />
                  <div className="ms-3">
                    <strong className="d-block text-dark">
                      {post.userId?.name || "Anonymous"}
                    </strong>
                    <small className="text-muted">Posted recently</small>
                  </div>
                </Link>
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
                initialComments={post.comments ?? []}
                currentUserId={currentUserId}
              />
            </div>
          ))}

          {/* Infinite Scroll Loader */}
          <div ref={loaderRef} className="text-center py-3">
            {loading && <div className="spinner-border text-secondary" />}
          </div>

          {!hasMore && (
            <p className="text-center text-muted">yes You've reached the end 🎉</p>
          )}
        </div>
      </div>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css"
      />
    </div>
  );
}