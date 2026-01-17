"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "@/styles/components/LikeButton.module.css";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  currentUserId: string;
  initiallyLiked?: boolean;
}

export default function LikeButton({ 
  postId, 
  initialCount, 
  currentUserId, 
  initiallyLiked = false 
}: LikeButtonProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [isLiked, setIsLiked] = useState<boolean>(initiallyLiked);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pulseKey, setPulseKey] = useState<number>(0);

  // Continuous pulse effect when liked
  useEffect(() => {
    if (!isLiked) return;

    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiked]);

  const handleLike = async (): Promise<void> => {
    if (!currentUserId) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setCount((prev: number) => newLikedState ? prev + 1 : Math.max(prev - 1, 0));
    setIsLoading(true);

    // Trigger immediate pulse on like
    if (newLikedState) {
      setPulseKey(prev => prev + 1);
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });

      if (!res.ok) {
        setIsLiked(!newLikedState);
        setCount((prev: number) => newLikedState ? prev - 1 : prev + 1);
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      setCount((prev: number) => newLikedState ? prev - 1 : prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const ringVariants = {
    initial: { scale: 0.8, opacity: 0.7 },
    animate: { 
      scale: 1.8, 
      opacity: 0,
      transition: { duration: 1.5, ease: "easeOut" as const }
    }
  };

  return (
    <div className={style.likeContainer}>
      <motion.button
        className={`${style.likeButton} ${isLiked ? style.liked : ''}`}
        onClick={handleLike}
        disabled={isLoading}
        whileTap={{ scale: 0.9 }}
      >
        {/* Continuous Pulse Rings */}
        <AnimatePresence>
          {isLiked && (
            <motion.div
              key={pulseKey}
              className={style.pulseRing}
              variants={ringVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '40px', height: '40px' }}
            />
          )}
        </AnimatePresence>

        <motion.span
          className={style.heartIcon}
          animate={isLiked ? { 
            scale: [1, 1.2, 1],
            transition: { duration: 0.3 }
          } : { scale: 1 }}
        >
          {isLiked ? "❤️" : "🤍"}
        </motion.span>
      </motion.button>
      
      <div className={style.likeCount}>
        {count}
      </div>
    </div>
  );
}