"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/componenet/Home/AuthButton.module.css";

export default function AuthButton() {
  const { data: session, status, update } = useSession(); // ✅ update available
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Refresh session whenever this component mounts
 

  // ✅ If not signed in
  if (!session) {
    return (
      <button
        onClick={() => router.push("/login")}
        className={`${styles.sign} btn btn-primary fw-semibold`}
      >
        Sign in
      </button>
    );
  }

  // ✅ If signed in
  return (
    <div className="position-relative align-self-end" ref={menuRef}>
      <div
        className={`${styles.authWrapper} d-flex align-items-center`}
        onClick={() => setOpen(!open)}
      >
        {/* User Avatar */}
        {session.user?.image && (
          <Image
            key={session.user.image || "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"} // force re-render on change
            src={session.user.image}
            alt={session.user.name || "User"}
            width={36}
            height={36}
            className={`${styles.authAvatar} rounded-circle`}
            unoptimized // optional if using external domains
          />
        )}

        <span className={`${styles.authName} ms-2 d-none d-sm-inline`}>
          {session.user?.name?.split(" ")[0]}
        </span>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded shadow-lg py-2"
          style={{ minWidth: "200px", zIndex: 1000 }}
        >
          <div className="px-3 py-2 border-bottom">
            <p className="mb-0 fw-semibold">{session.user?.name}</p>
            <small className="text-muted">{session.user?.email}</small>
          </div>

          <button
            onClick={() => router.push(`/profile/${session.user.id}`)}
            className="dropdown-item d-flex align-items-center py-2"
          >
            <i className="bi bi-person me-2"></i>
            Profile
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="dropdown-item d-flex align-items-center py-2"
          >
            <i className="bi bi-gear me-2"></i>
            Settings
          </button>

          <div className="dropdown-divider my-1"></div>

          <button
            onClick={async () => {
              await signOut({ redirect: false }); // optional: prevent redirect
              setOpen(false);

               router.push("/home?success=logout");
            }}
            className="dropdown-item d-flex align-items-center py-2 text-danger"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
