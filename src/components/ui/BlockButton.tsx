"use client";

import { Button } from "react-bootstrap";
import { useState } from "react";

interface BlockButtonProps {
  userId: string;
  onBlocked?: () => void;
}

export default function BlockButton({ userId, onBlocked }: BlockButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/settings/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to block user");
      }

      onBlocked?.();
    } catch (err) {
      console.error("BLOCK_ERROR:", err);
      alert("Failed to block user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="dropdown-item text-danger"
      disabled={loading}
      onClick={handleBlock}
    >
      {loading ? "Blocking..." : "Block"}
    </button>
  );
}
