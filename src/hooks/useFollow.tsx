import { useState, useEffect } from "react";

type FollowStatus = "none" | "pending" | "approved";

export const useFollow = (
  profileUserId: string,
  loggedInUserId?: string,
  onUpdate?: () => void
) => {
  const [status, setStatus] = useState<FollowStatus>("none");
  const [loading, setLoading] = useState(false);

  // 🔁 Fetch follow status (approved OR pending)
  useEffect(() => {
    if (!profileUserId || !loggedInUserId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/follow/status?targetUserId=${profileUserId}`
        );
        if (!res.ok) return;

        const data = await res.json();
        setStatus(data.status); // "none" | "pending" | "approved"
      } catch (err) {
        console.error("Fetch follow status error", err);
      }
    };

    fetchStatus();
  }, [profileUserId, loggedInUserId]);

  // 🔁 Toggle follow
  const toggleFollow = async () => {
    if (!profileUserId || !loggedInUserId) return;

    setLoading(true);
    try {
      if (status === "none") {
        // 👉 SEND FOLLOW / REQUEST
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerId: loggedInUserId,
            followingId: profileUserId,
          }),
        });

        if (!res.ok) throw new Error("Follow failed");

        const data = await res.json();
        setStatus(data.status); // "pending" or "approved"
      } else {
        // 👉 UNFOLLOW or CANCEL REQUEST
        await fetch("/api/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerId: loggedInUserId,
            followingId: profileUserId,
          }),
        });

        setStatus("none");
      }

      onUpdate?.();
    } catch (err) {
      console.error("Toggle follow error", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing: status === "approved",
    isPending: status === "pending",
    loading,
    toggleFollow,
  };
};
