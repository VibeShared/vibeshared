"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import LikeButton from "@/componenets/Other/LikeButton";
import CommentSection from "@/componenets/Other/CommentSection";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DeletePostButton from "@/componenets/Other/DeletePostButton";

export default function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCommentSections, setActiveCommentSections] = useState<
    Set<string>
  >(new Set());
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";
  const isInitialMount = useRef(true);

  // Toggle comment section visibility
  const toggleComments = (postId: string) => {
    setActiveCommentSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // ✅ Memoized fetch function without loading dependency
  const fetchPosts = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/post?page=${page}&limit=10`);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch posts: ${res.status} ${res.statusText}`
        );
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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="text-warning mb-3">
                  <i className="bi bi-exclamation-triangle display-4"></i>
                </div>
                <h5 className="card-title">Unable to load posts</h5>
                <p className="card-text text-muted mb-4">{error}</p>
                <button
                  onClick={retryFetch}
                  className="btn btn-primary rounded-pill px-4"
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="text-muted mb-3">
                  <i className="bi bi-inbox display-4"></i>
                </div>
                <h5 className="card-title">No posts available</h5>
                <p className="card-text text-muted mb-4">
                  Follow some users or create your first post!
                </p>
                <button className="btn btn-primary rounded-pill px-4">
                  Explore Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Stories Section */}
      {/* <div className="container-fluid bg-white border-bottom py-3">
        <div className="container">
          <div className="d-flex overflow-auto pb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="text-center mx-2">
                <div className="position-relative">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center" style={{width: '64px', height: '64px'}}>
                    <img 
                      src={`https://i.pravatar.cc/64?img=${i}`} 
                      className="rounded-circle" 
                      width="60" 
                      height="60" 
                      alt={`User ${i}`}
                    />
                  </div>
                  <span className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{width: '14px', height: '14px'}}></span>
                </div>
                <small className="d-block mt-1 text-truncate" style={{maxWidth: '64px'}}>User {i}</small>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Posts Section */}
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {posts.map((post) => (
              <div key={post._id} className="card shadow-sm mb-4 border-0">
                {/* Header */}
                <div className="card-header bg-white border-0 pt-3 pb-1">
                  <div className="d-flex align-items-center">
                    <Link
                      href={`/profile/${post.userId?._id ?? ""}`}
                      className="d-flex align-items-center text-decoration-none text-dark"
                    >
                      <img
                        src={
                          post.userId?.image ||
                          "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"
                        }
                        alt={post.userId?.name || "Guest User"}
                        width="40"
                        height="40"
                        className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
                      />
                      <div className="ms-3">
                        <strong className="d-block">
                          {post.userId?.name || "User"}
                        </strong>
                        <small className="text-muted">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </small>
                      </div>
                    </Link>
                    <span className="btn btn-link text-muted ms-auto p-0">
                      <i className="bi bi-three-dots"></i>

                      <DeletePostButton
                        postId={post._id}
                        currentUserId={currentUserId}
                        postOwnerId={post.userId?._id ?? ""}
                        onDelete={handlePostDelete}
                      />
                    </span>
                  </div>
                </div>

                {/* Media */}
                {post.mediaUrl && (
                  <div className="card-img-top">
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="img-fluid w-100"
                      style={{ objectFit: "cover", maxHeight: "500px" }}
                    />
                  </div>
                )}

                <div className="card-body">
                  {/* Content */}
                  {post.content && (
                    <p className="card-text mb-2">{post.content}</p>
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
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center"
                      onClick={() => toggleComments(post._id)}
                    >
                      <i className="bi bi-chat me-1"></i>
                      Comment
                    </button>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center">
                      <i className="bi bi-share me-1"></i>
                      Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentSections.has(post._id) && (
                    <CommentSection
                      postId={post._id}
                      initialComments={post.comments ?? []}
                      currentUserId={currentUserId}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Infinite Scroll Loader */}
            <div ref={loaderRef} className="text-center py-3">
              {loading && (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>

            {!hasMore && (
              <p className="text-center text-muted py-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                You've reached the end 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Create Post Button */}
      <div className="position-fixed bottom-0 end-0 m-4">
        <button
          className="btn btn-primary rounded-circle shadow"
          style={{ width: "60px", height: "60px" }}
        >
          <i className="bi bi-plus-lg fs-4"></i>
        </button>
      </div>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css"
      />
    </div>
  );
}
