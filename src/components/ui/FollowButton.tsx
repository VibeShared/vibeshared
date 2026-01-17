"use client";

import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useFollow } from "@/hooks/useFollow";

interface FollowActionButtonProps {
  targetUserId: string;
  onUpdate?: () => void;
  size?: "sm" | "lg";
}

export default function FollowButton({
  targetUserId,
  onUpdate,
  size = "sm",
}: FollowActionButtonProps) {
  const { data: session } = useSession();

  const {
    isFollowing,
    isPending,
    loading,
    toggleFollow,
  } = useFollow(targetUserId, session?.user?.id, onUpdate);

  // hide if not logged in or self profile
  if (!session?.user?.id || session.user.id === targetUserId) {
    return null;
  }

  const label = isPending
    ? "Cancel Request"
    : isFollowing
    ? "Unfollow"
    : "Follow";

  const variant = isPending
    ? "secondary"
    : isFollowing
    ? "outline-danger"
    : "primary";

  const tooltip = isPending
    ? "Cancel follow request"
    : isFollowing
    ? "Unfollow"
    : "Follow";

  return (
    <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
      <Button
        size={size}
        variant={variant}
        disabled={loading}
        onClick={toggleFollow}
        className="fw-semibold rounded-pill"
      >
        {loading ? "..." : label}
      </Button>
    </OverlayTrigger>
  );
}
