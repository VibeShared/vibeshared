"use client";

import { useEffect, useState } from "react";

interface Withdrawal {
  _id: string;
  userId: { _id: string; name: string; email: string };
  upiId: string; // ✅ Add this
  walletBalance: number; // ✅ Add this
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchWithdrawals() {
  setLoading(true);
  try {
    const res = await fetch("/api/admin/withdrawals");
    const data = await res.json();

    if (res.ok) {
      // ✅ Sort latest first
      const sorted = data.sort((a: Withdrawal, b: Withdrawal) => {
  // 1️⃣ Pending first
  if (a.status === "pending" && b.status !== "pending") return -1;
  if (a.status !== "pending" && b.status === "pending") return 1;

  // 2️⃣ Latest first
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});

setWithdrawals(sorted);
    }
  } catch (err) {
    console.error("Failed to fetch withdrawals", err);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId: id, action }),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data.error || "Failed to process");

      setWithdrawals((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: data.status } : w))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="container py-4">
      <h3 className="mb-3">Admin: Withdrawals</h3>

      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawals</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>UPI ID</th> {/* ✅ New Column */}
              <th>Wallet Balance</th> {/* ✅ New Column */}
              <th>Amount</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w._id}>
                <td>{w.userId.name}</td>
                <td>{w.userId.email}</td>
                <td>{w.upiId || "N/A"}</td> {/* ✅ Show UPI ID */}
                <td>₹{w.walletBalance}</td> {/* ✅ Show Wallet Balance */}
                <td>₹{w.amount}</td>
                <td>{w.status}</td>
                <td>{new Date(w.createdAt).toLocaleString()}</td>
                <td>
                  {w.status === "pending" ? (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleAction(w._id, "approve")}
                        disabled={processingId === w._id}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction(w._id, "reject")}
                        disabled={processingId === w._id}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
