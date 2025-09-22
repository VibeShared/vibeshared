"use client";

import Link from "next/link";
import LikeButton from "@/componenets/Other/LikeButton";
import CommentSection from "@/componenets/Other/CommentSection";
import DeletePostButton from "@/componenets/Other/DeletePostButton";
import { useState, useRef, useEffect } from "react";
import style from "@/styles/componenet/post/PostCard.module.css"

interface PostCardProps {
  post: any;
  currentUserId: string;
  isCommentsOpen: boolean;
  toggleComments: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  isCommentsOpen,
  toggleComments,
  onDelete,
}: PostCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  
  let lastTap = 0;

  // Video click (play/pause)
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowOverlay(true);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 1000);
    }
  };

  // Mute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Double-tap like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      // Optional: trigger like API
    }
    lastTap = now;
  };

  // Autoplay/pause when in viewport
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
  setShowOverlay(true);
  const timer = setTimeout(() => setShowOverlay(false), 2000);
  return () => clearTimeout(timer);
}, []);

// Show overlay when user hovers or taps the video
const handleMouseEnter = () => setShowOverlay(true);
const handleMouseLeave = () => setShowOverlay(false);
const handleVideoTap = () => {
  setShowOverlay(true);
  setTimeout(() => setShowOverlay(false), 1000); // auto-hide after 1s
};

  return (
    <div className={`${style.card} card shadow-sm mb-4 border-0 `}>
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
              <strong className="d-block">{post.userId?.name || "User"}</strong>
              <small className="text-muted">
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </small>
            </div>
          </Link>

          <span className="btn btn-link text-muted ms-auto p-0">
            <i className="bi bi-three-dots"></i>
            <DeletePostButton
              postId={post._id}
              currentUserId={currentUserId}
              postOwnerId={post.userId?._id ?? ""}
              onDelete={onDelete}
            />
          </span>
        </div>
      </div>

      {/* Media Section */}
      {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
      <div
   className={`${style.postVideo} position-relative w-100 overflow-hidden mb-2`}
   
  onClick={() => {
    handleDoubleTap();
    handleVideoTap(); // show overlay on tap
  }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
 <video
  ref={videoRef}
  src={post.mediaUrl}
  className="position-absolute top-0 start-0 w-100 h-100"
  style={{ objectFit: "cover", cursor: "pointer" }}
  muted
  playsInline
  loop
  autoPlay
  onClick={handleVideoClick}
/>

  {/* Play/Pause Overlay */}
  <div
    className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center"
    style={{
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "rgba(0,0,0,0.5)",
      opacity: showOverlay ? 1 : 0,
      transition: "opacity 0.4s ease",
      pointerEvents: "none",
      zIndex: 2,
    }}
  >
    <i
      className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"} text-white fs-1`}
    ></i>
  </div>

  {/* Mute Button */}
  <button
    className="position-absolute bottom-0 end-0 m-2 btn p-2"
    style={{ zIndex: 3, height: "25px", width: "25px" }}
    onClick={(e) => {
      e.stopPropagation();
      if (!videoRef.current) return;
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }}
  >
    <i className={`bi ${isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"} text-white`}></i>
  </button>

  {/* Double-tap heart */}
  {showHeart && (
    <div
      className="position-absolute top-50 start-50 translate-middle text-danger fs-1"
      style={{ pointerEvents: "none", animation: "fade 0.8s forwards", zIndex: 4 }}
    >
      <i className="bi bi-heart-fill"></i>
    </div>
  )}
</div>

      ) : (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="img-fluid w-100 rounded mb-2"
          style={{ objectFit: "cover", maxWidth: "468px" }}
          loading="lazy"
        />
      )}

      {/* Body */}
      <div className="card-body px-3 py-2">
        

        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>{post.likesCount} likes</span>
          <span>{post.comments?.length ?? 0} comments</span>
        </div>

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
            <i className="bi bi-chat me-1"></i> Comment
          </button>
          <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center">
            <i className="bi bi-share me-1"></i> Share
          </button>

        </div>
        {post.content && <p className="card-text mb-2">{post.content}</p>}

        {isCommentsOpen && (
          <CommentSection postId={post._id} currentUserId={currentUserId} />
        )}
      </div>

      
    </div>
  );
}
