"use client";

import { Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useFollow } from "@/components/hooks/useFollow";

interface FollowActionButtonProps {
  targetUserId: string;
  onUpdate?: () => void;
  size?: "sm" | "lg";
  variant?: "primary" | "outline-primary";
}

export default function FollowButton({
  targetUserId,
  onUpdate,
  size = "sm",
}: FollowActionButtonProps) {
  const { data: session } = useSession();

  const { isFollowing, loading, toggleFollow } = useFollow(
    targetUserId,
    session?.user?.id,
    onUpdate
  );

  // safety: hide button if user is not logged in or self-profile
  if (!session?.user?.id || session.user.id === targetUserId) return null;

  return (
    <Button
      size={size}
      disabled={loading}
      onClick={toggleFollow}
      variant={isFollowing ? "outline-danger" : "outline-primary"}
      className="fw-semibold rounded-pill"
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
