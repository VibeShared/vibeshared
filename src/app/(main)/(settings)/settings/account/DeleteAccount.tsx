"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const router = useRouter();

  const handleDelete = async () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "This will permanently remove your profile, posts, and interactions. Continue?"
    );

    if (!secondConfirm) return;

    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete account");
      }

      toast.success("Your account has been deleted");

      // Clear client state & redirect
      router.replace("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="card border-danger p-4">
      <h5 className="text-danger mb-3">Danger Zone</h5>

      <p className="text-muted">
        Deleting your account is permanent. All your data, posts, and
        interactions will be removed. This action cannot be undone.
      </p>

      <button className="btn btn-danger" onClick={handleDelete}>
        Delete account
      </button>
    </div>
  );
}
