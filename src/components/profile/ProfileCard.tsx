"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/components/profile/ProfilePersonal.module.css";
import {
  Card,
  Button,
  Spinner,
  Toast,
  ToastContainer,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { CloudUpload, X } from "react-bootstrap-icons";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FollowersModal } from "./FollowersModal";
import { useRouter } from "next/navigation";
import FollowButton from "@/components/ui/FollowButton";

interface UserProfile {
  id?: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

interface ProfileCardProps {
  user: UserProfile;
  isOwnProfile?: boolean;
}

export default function ProfilePersonal({
  user,
  isOwnProfile = false,
}: ProfileCardProps) {
  const { data: session, update } = useSession();
  const loggedInUserId = session?.user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastApiCallRef = useRef(0);
  const lastFollowClick = useRef(0);
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);

  const [imagePreview, setImagePreview] = useState(user.image || "");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success" as "success" | "danger",
  });

  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // ================= Fetch followers/following =================
  const fetchCounts = useCallback(async () => {
    if (!user.id) return;

    const [followersRes, followingRes] = await Promise.all([
      fetch(`/api/follow?userId=${user.id}&type=followers`),
      fetch(`/api/follow?userId=${user.id}&type=following`),
    ]);

    const followers = await followersRes.json();
    const following = await followingRes.json();

    setFollowersCount(followers.length);
    setFollowingCount(following.length);
    setFollowersList(followers.map((f: any) => ({ user: f.follower })));
    setFollowingList(following.map((f: any) => ({ user: f.following })));
  }, [user.id]);


  useEffect(() => {
    setImagePreview(user.image || "");
    fetchCounts();
  }, [user, fetchCounts]);

  const showToast = (
    message: string,
    variant: "success" | "danger" = "success"
  ) => {
    setToast({ show: true, message, variant });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user.id) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);

      // 1️⃣ Upload to Cloudinary
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // 2️⃣ Save avatar to user profile
      const profileRes = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadData.url,
        }),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error);

      // 3️⃣ Update UI + session
      setImagePreview(uploadData.url);
      await update?.({ user: { image: uploadData.url } });

      showToast("Profile photo updated");
    } catch (err: any) {
      showToast(err.message || "Avatar update failed", "danger");
    } finally {
      setIsUploading(false);
    }
  };


  // ================= UI =================
  return (
    <>
      <Card className={`${styles.profileCard} shadow-sm mb-4`}>
        <Card.Body className="p-4 text-center">
          <div className={styles.avatarWrapper}>
            <Image
              src={imagePreview || "/avatar.png"}
              alt="Avatar"
              width={120}
              height={120}
              className="rounded-circle"
            />

            {isOwnProfile && (
              <button
                type="button"
                className={styles.avatarEdit}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Spinner size="sm" />
                ) : (
                  <CloudUpload size={18} />
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <h5 className="mt-3">{user.name}</h5>
          <p className="text-muted">@{user.username}</p>

          {user.bio && <p className="mt-2 text-secondary small">{user.bio}</p>}

          {user.location && (
            <p className="mb-1 small text-muted">📍 {user.location}</p>
          )}

          {user.website && (
            <p className="small">
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {user.website}
              </a>
            </p>
          )}

          <div className="d-flex justify-content-center gap-4 mt-3">
            <button
              className="btn btn-link"
              onClick={() => setShowFollowersModal(true)}
            >
              {followersCount ?? <Spinner size="sm" />} Followers
            </button>
            <button
              className="btn btn-link"
              onClick={() => setShowFollowingModal(true)}
            >
              {followingCount ?? <Spinner size="sm" />} Following
            </button>
          </div>

          {!isOwnProfile && (
  <FollowButton
    targetUserId={user.id!}
    onUpdate={fetchCounts}
  />
)}
        </Card.Body>
      </Card>

      {/* Modals */}
      <FollowersModal
        show={showFollowersModal}
        onHide={() => setShowFollowersModal(false)}
        list={followersList}
        title="Followers"
      />
      <FollowersModal
        show={showFollowingModal}
        onHide={() => setShowFollowingModal(false)}
        list={followingList}
        title="Following"
      />

      {/* Toast */}
      <ToastContainer position="top-end">
        <Toast
          show={toast.show}
          bg={toast.variant}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
