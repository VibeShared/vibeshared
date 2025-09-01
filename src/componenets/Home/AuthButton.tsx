"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/componenet/Home/AuthButton.module.css";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // ✅ If not signed in
  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className={`${styles.sign} btn btn-outline-primary fw-semibold`}
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
        {/* User Avatar (always visible) */}
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={36}
            height={36}
            className={`${styles.authAvatar} rounded-circle`}
          />
        )}

        {/* Username (hidden on xs, visible on sm and up) */}
        <span className={`${styles.authName} ms-2 d-none d-sm-inline`}>
          {session.user?.name?.split(" ")[0]}
        </span>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className={styles.dropdownMenu}>
          <p>{session.user?.name}</p>
          <button
            onClick={() => signOut()}
            className="btn btn-sm btn-outline-danger w-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
