"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/components/profile/ProfilePersonal.module.css";
import {
  Card,
  Button,
  Modal,
  Form,
  Spinner,
  Toast,
  ToastContainer,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { CloudUpload, X } from "react-bootstrap-icons";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useFollow } from "@/components/hooks/useFollow";
import { FollowersModal } from "./FollowersModal";

interface UserProfile {
  id?: string;
  name?: string | null;
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

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200).optional(),
  location: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), {
      message: "Must be a valid URL",
    }),
});

export default function ProfilePersonal({
  user,
  isOwnProfile = false,
}: ProfileCardProps) {
  const { data: session, update } = useSession();
  const loggedInUserId = session?.user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastApiCallRef = useRef(0);
  const lastFollowClick = useRef(0);

  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

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

  const showToast = (message: string, variant: "success" | "danger" = "success") =>
    setToast({ show: true, message, variant });

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

  const { isFollowing, loading, toggleFollow } = useFollow(
    user.id!,
    loggedInUserId,
    fetchCounts
  );

  useEffect(() => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setImagePreview(user.image || "");
    fetchCounts();
  }, [user, fetchCounts]);

  // ================= Handlers =================
  const handleSave = async () => {
    if (!isOwnProfile || !user.id) return;

    if (Date.now() - lastApiCallRef.current < 2000) {
      showToast("Please wait before retrying", "danger");
      return;
    }

    lastApiCallRef.current = Date.now();
    setIsSaving(true);

    const parsed = profileSchema.safeParse(formData);
    if (!parsed.success) {
      showToast(parsed.error.issues[0].message, "danger");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await update?.({ user: data.user });
      setShowEdit(false);
      showToast("Profile updated");
    } catch (err: any) {
      showToast(err.message, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowClick = () => {
    if (Date.now() - lastFollowClick.current < 500) return;
    lastFollowClick.current = Date.now();
    toggleFollow();
  };

  // ================= UI =================
  return (
    <>
      <Card className={`${styles.profileCard} shadow-sm mb-4`}>
        <Card.Body className="p-4 text-center">
          <Image
            src={imagePreview || "/avatar.png"}
            alt="Avatar"
            width={120}
            height={120}
            className="rounded-circle"
          />

          <h5 className="mt-3">{user.name}</h5>
          <p className="text-muted">@{user.email?.split("@")[0]}</p>

          <div className="d-flex justify-content-center gap-4 mt-3">
            <button className="btn btn-link" onClick={() => setShowFollowersModal(true)}>
              {followersCount ?? <Spinner size="sm" />} Followers
            </button>
            <button className="btn btn-link" onClick={() => setShowFollowingModal(true)}>
              {followingCount ?? <Spinner size="sm" />} Following
            </button>
          </div>

          {isOwnProfile ? (
            <Button size="sm" onClick={() => setShowEdit(true)}>
              Edit Profile
            </Button>
          ) : (
            <OverlayTrigger
              overlay={<Tooltip>{isFollowing ? "Unfollow" : "Follow"}</Tooltip>}
            >
              <Button
                size="sm"
                variant={isFollowing ? "outline-danger" : "primary"}
                disabled={loading}
                onClick={handleFollowClick}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </OverlayTrigger>
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

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            className="mb-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
