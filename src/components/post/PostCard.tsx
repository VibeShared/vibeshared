// src/components/Post component/PostCard.tsx
"use client";

import Link from "next/link";
import LikeButton from "@/components/ui/LikeButton";
import DeletePostButton from "@/components/ui/DeletePostButton";
import { useState, useRef, useEffect } from "react";
import style from "@/styles/components/post/PostCard.module.css";
import TipButton from "@/components/payment/payment";
import { MessageCircle, Share2 } from "lucide-react";
import ShareButton from "@/components/ui/ShareButton";
import BlockButton from "@/components/ui/BlockButton";


interface PostCardProps {
  post: any;
  currentUserId: string;
  onOpenComments: (postId: string) => void;
  onDelete: (postId: string) => void;
  onBlockUser: (userId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onOpenComments,
  onDelete,
  onBlockUser,
}: PostCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);


  const postUserId =
  typeof post.userId === "string"
    ? post.userId
    : post.userId?._id ?? "";


    const postOwnerId =
  typeof post.userId === "string"
    ? post.userId
    : post.userId?._id ?? "";

  let lastTap = 0;

  interface ShareButtonProps {
  post: any;
}



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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap = now;
  };

  useEffect(() => {
  const videoEl = videoRef.current;
  if (!videoEl) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Play when in view
          videoEl.play().catch((err) => {
            // Handle browsers that block autoplay
            console.log("Autoplay prevented", err);
          });
          setIsPlaying(true);
        } else {
          // Pause when out of view
          videoEl.pause();
          setIsPlaying(false);
        }
      });
    },
    { threshold: 0.6 } // Slightly higher threshold feels better for users
  );

  observer.observe(videoEl);
  return () => observer.disconnect();
}, []);

  useEffect(() => {
    setShowOverlay(true);
    const timer = setTimeout(() => setShowOverlay(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => setShowOverlay(true);
  const handleMouseLeave = () => setShowOverlay(false);
  const handleVideoTap = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 1000);
  };








  return (
    
    <div className={`${style.card} card shadow-sm mb-4 border-0`}>
      {/* Header */}
      <div className="card-header bg-white border-0 pt-3 pb-1">
        <div className="d-flex align-items-center">
          <Link
            href={`/profile/${post.userId?.username ?? ""}`}
            className="d-flex align-items-center text-decoration-none text-dark"
          >
            <img
              src={
                post.userId?.image ||
                "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"
              }
              alt={post.userId?.username || "Guest User"}
              width="40"
              height="40"
              className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
            />
            <div className="ms-3">
              <strong className="d-block">{post.userId?.username || "User"}</strong>
              <small className="text-muted">
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </small>
            </div>
          </Link>

          <span className="ms-auto ">
            <button
              className="btn btn-link text-muted ms-auto p-0"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li className="dropdown-item">
               
                  <DeletePostButton
  postId={post._id}
  currentUserId={currentUserId}
  postOwnerId={postOwnerId}
/>
                
              </li>
              <li>
  {postUserId && postUserId !== currentUserId && (
  <BlockButton
    userId={postUserId}
    onBlocked={() => {
      onBlockUser(postUserId);
    }}
  />
)}
</li>
            </ul>
          </span>
        </div>
      </div>

      {/* Media Section */}
      {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
        <div
          className={`${style.postVideo} position-relative w-100 overflow-hidden mb-2`}
          onClick={() => {
            handleDoubleTap();
            handleVideoTap();
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
              className={`bi ${
                isPlaying ? "bi-pause-fill" : "bi-play-fill"
              } text-white fs-1`}
            ></i>
          </div>

          {/* Mute Button */}
          <button
            className="position-absolute bottom-0 end-0 m-2 btn p-2"
            style={{ zIndex: 3, height: "25px", width: "25px" }}
            onClick={toggleMute}
          >
            <i
              className={`bi ${
                isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"
              } text-white`}
            ></i>
          </button>

          {/* Double-tap heart */}
          {showHeart && (
            <div
              className="position-absolute top-50 start-50 translate-middle text-danger fs-1"
              style={{
                pointerEvents: "none",
                animation: "fade 0.8s forwards",
                zIndex: 4,
              }}
            >
              <i className="bi bi-heart-fill"></i>
            </div>
          )}
        </div>
      ) : (
        <img
          src={post.mediaUrl || null}
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

        <div className="d-flex border-top border-bottom py-2 mb-3">
          <LikeButton
            postId={post._id}
            initialCount={post.likesCount}  
            currentUserId={currentUserId}
            initiallyLiked={post.isLiked} // ✅ now always correct after reload
          />
          <button
  className="btn btn-sm d-flex align-items-center mb-5"
  onClick={() => onOpenComments(post._id)}
>
  <MessageCircle size={30} />
</button>

          <TipButton
            creatorName={post.userId?.name || "User"}
            buyMeACoffeeLink="https://buymeacoffee.com/vibeshared"
          />
        <ShareButton post={post} />



        </div>

        {post.content && <p className="card-text mb-2">{post.content}</p>}

      </div>
    </div>
  );
}
