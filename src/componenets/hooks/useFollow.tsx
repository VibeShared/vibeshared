import { useState, useEffect } from "react";

export const useFollow = (
  profileUserId: string,
  loggedInUserId?: string,
  onUpdate?: () => void
) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileUserId || !loggedInUserId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/follow?userId=${profileUserId}&type=followers`
        );
        if (!res.ok) return;
        const data = await res.json();
        const following = data.some((f: any) => f.follower._id === loggedInUserId);
        setIsFollowing(following);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [profileUserId, loggedInUserId]);

  const toggleFollow = async () => {
    if (!profileUserId || !loggedInUserId) return;
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: loggedInUserId,
          followingId: profileUserId,
        }),
      });
      if (!res.ok) throw new Error("Failed to follow/unfollow");

      setIsFollowing(!isFollowing);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
};
