"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Request {
  _id: string;
  follower: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
}

export default function FollowRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch("/api/follow/requests");
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (
    followerId: string,
    action: "accept" | "reject"
  ) => {
    await fetch("/api/follow/requests/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerId, action }),
    });

    toast.success(
      action === "accept" ? "Request accepted" : "Request rejected"
    );

    setRequests((prev) =>
      prev.filter((r) => r.follower._id !== followerId)
    );
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="card p-4 mt-4">
      <h5 className="mb-3">Follow Requests</h5>

      {requests.map((r) => (
        <div
          key={r._id}
          className="d-flex align-items-center justify-content-between mb-3"
        >
          <div className="d-flex align-items-center gap-2">
            <Image
              src={r.follower.image || "/avatar.png"}
              width={40}
              height={40}
              className="rounded-circle"
              alt={r.follower.name}
            />
            <div>
              <div className="fw-semibold">{r.follower.name}</div>
              <small className="text-muted">
                @{r.follower.username}
              </small>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleAction(r.follower._id, "reject")}
            >
              Reject
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleAction(r.follower._id, "accept")}
            >
              Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
