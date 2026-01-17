"use client";

import { memo } from "react";
import { useBlockedUsers, useUnblockUser } from "@/hooks/useBlockedUsers";
import toast from "react-hot-toast";

function BlockedUsersList() {
  const { data, isLoading, isError } = useBlockedUsers();
  const unblockMutation = useUnblockUser();

  if (isLoading) {
    return <div className="card p-4">Loading blocked users…</div>;
  }

  if (isError) {
    return (
      <div className="card p-4 text-danger">
        Failed to load blocked users
      </div>
    );
  }

  const blockedUsers = data?.blockedUsers || [];

  const handleUnblock = (userId: string, username: string) => {
    const confirmed = window.confirm(
      `Unblock @${username}? They will be able to interact with you again.`
    );

    if (!confirmed) return;

    unblockMutation.mutate(userId, {
      onSuccess: () => toast.success("User unblocked"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="card p-4">
      <h5 className="mb-4">Blocked Users</h5>

      {blockedUsers.length === 0 ? (
        <div className="text-muted">You haven’t blocked anyone.</div>
      ) : (
        <ul className="list-group list-group-flush">
          {blockedUsers.map((item: any) => (
            <li
              key={item._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center gap-3">
                <img
                  src={item.blocked.image}
                  alt={item.blocked.username}
                  width={40}
                  height={40}
                  className="rounded-circle"
                />
                <div>
                  <div className="fw-semibold">
                    {item.blocked.name}
                  </div>
                  <div className="text-muted small">
                    @{item.blocked.username}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-outline-danger btn-sm"
                disabled={unblockMutation.isPending}
                onClick={() =>
                  handleUnblock(
                    item.blocked._id,
                    item.blocked.username
                  )
                }
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(BlockedUsersList);
