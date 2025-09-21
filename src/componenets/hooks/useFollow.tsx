// hooks/useFollow.ts
import { useState, useEffect } from "react";

export function useFollow(targetUserId: string, loggedInUserId?: string, onChangeCounts?: () => void) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
useEffect(() => {
  if (!loggedInUserId) return;

  const fetchFollowing = async () => {
    const res = await fetch(`/api/follow?userId=${loggedInUserId}&type=following`);
    const data = await res.json();

    if (Array.isArray(data)) {
      // Use f.user._id instead of f.following._id
      setIsFollowing(
  data.some((f: any) => f.user && f.user._id === targetUserId)
);
    }
  };

  fetchFollowing();
}, [loggedInUserId, targetUserId]);

  const toggleFollow = async () => {
    if (!loggedInUserId) return;
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: loggedInUserId, followingId: targetUserId }),
      });
      const data = await res.json();
      if (!data.error) {
        setIsFollowing(!isFollowing);
        if (onChangeCounts) onChangeCounts();
        
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
}

