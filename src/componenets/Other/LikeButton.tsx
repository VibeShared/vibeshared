"use client";

import { useState } from "react";
import style from "@/styles/componenet/LikeButton.module.css";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  currentUserId: string;
}

export default function LikeButton({
  postId,
  initialCount,
  currentUserId,
}: LikeButtonProps) {
  const [count, setCount] = useState<number>(initialCount ?? 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  async function handleLike() {
    if (!currentUserId) return alert("You must be logged in");

    try {
      setIsLiking(true);
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });

      if (!res.ok) throw new Error("Failed to like post");

      const data = await res.json();
      const wasUnliked = data.message === "Post unliked";

      setCount((prev) => (wasUnliked ? Math.max(prev - 1, 0) : prev + 1));
      setIsLiked(!wasUnliked);

      if (!wasUnliked) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 600);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <div className="position-relative">
      <button
        className={`${style.likeBtn} ${isLiked ? style.liked : ""} ${
          isLiking ? style.liking : ""
        }`}
        onClick={handleLike}
        disabled={isLiking}
        aria-label={isLiked ? "Unlike this post" : "Like this post"}
      >
        <div className={style.likeBtnContent}>
          <div className={style.heartContainer}>
            <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`}></i>
          </div>
          <span className={style.likeCount}>{count}</span>
        </div>
      </button>

      {showAnimation && (
        <>
          <div className={style.heartBurstAnimation}>
            <i className="bi bi-heart-fill"></i>
          </div>
          <div className={style.particleAnimation}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={style.particle}
                style={
                  {
                    "--angle": `${i * 60}deg`,
                    "--delay": `${i * 0.1}s`,
                  } as React.CSSProperties
                }
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
