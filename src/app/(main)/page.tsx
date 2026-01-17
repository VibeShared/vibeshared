"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import PostCard from "@/components/post/PostCard";
import CommentModal from "@/components/comment/CommentModal";


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
  const [activePostId, setActivePostId] = useState<string | null>(null);

 

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
  }, [page]);

 

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
      

      {/* Posts Section */}
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {posts.map((post) => (
  <PostCard
  key={post._id}
  post={post}
  currentUserId={currentUserId}
  onOpenComments={(postId) => setActivePostId(postId)}
  onDelete={handlePostDelete}
  onBlockUser={(blockedUserId) => {
    setPosts(prev =>
      prev.filter(p => p.userId.id !== blockedUserId)
    );
  }}
/>
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

      <CommentModal
  postId={activePostId}
  currentUserId={currentUserId}
  onClose={() => setActivePostId(null)}
/>
      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css"
      />


    </div>
  );
}
