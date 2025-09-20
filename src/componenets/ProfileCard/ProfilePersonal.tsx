// src/components/ProfileCard/ProfilePersonal.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/componenet/profile/ProfilePersonal.module.css";
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
import { useFollow } from "../hooks/useFollow";
import Link from "next/link";

interface UserProfile {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

interface FollowersModalProps {
  show: boolean;
  onHide: () => void;
  list: any[];
  title: string;
}

interface ProfileCardProps {
  user: UserProfile;
  isOwnProfile?: boolean;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  location: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), {
      message: "Must be a valid URL (start with http:// or https://)",
    }),
});

export default function ProfileCard({
  user,
  isOwnProfile = false,
}: ProfileCardProps) {
  const { data: session, update } = useSession();
  const loggedInUserId = session?.user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastApiCallRef = useRef<number>(0);
  const lastFollowClick = useRef<number>(0);

  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user.image || "");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">(
    "success"
  );
  const [showToast, setShowToast] = useState(false);

  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  // Fetch counts and lists
  const fetchCounts = useCallback(async () => {
    if (!user.id) return;
    try {
      const resFollowers = await fetch(
        `/api/follow?userId=${user.id}&type=followers`
      );
      const resFollowing = await fetch(
        `/api/follow?userId=${user.id}&type=following`
      );
      const followers = await resFollowers.json();
      const following = await resFollowing.json();
      setFollowersCount(Array.isArray(followers) ? followers.length : 0);
      setFollowingCount(Array.isArray(following) ? following.length : 0);
      setFollowersList(Array.isArray(followers) ? followers : []);
      setFollowingList(Array.isArray(following) ? following : []);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  }, [user.id]);

  useEffect(() => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setImagePreview(user.image || "");
    fetchCounts();
  }, [
    user.id,
    user.name,
    user.bio,
    user.location,
    user.website,
    user.image,
    fetchCounts,
  ]);

  // Follow/unfollow hook
  const { isFollowing, loading, toggleFollow } = useFollow(
    user.id!,
    loggedInUserId,
    fetchCounts
  );

  const showToastMessage = useCallback(
    (message: string, variant: "success" | "danger" = "success") => {
      setToastMessage(message);
      setToastVariant(variant);
      setShowToast(true);
    },
    []
  );

  const handleChange = useCallback(
  (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
  []
);

  const handleSave = async () => {
    if (!isOwnProfile) return;

    const now = Date.now();
    if (now - lastApiCallRef.current < 2000) {
      showToastMessage("Please wait before making another request", "danger");
      return;
    }
    lastApiCallRef.current = now;

    setIsSaving(true);

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      showToastMessage(result.error.issues[0].message, "danger");
      setIsSaving(false);
      return;
    }

    try {
      if (!user.id) throw new Error("User ID not available");

      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      const updatedUser = await res.json();
      if (update) await update({ user: updatedUser.user });
      showToastMessage("Profile updated successfully!");
      setShowEdit(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showToastMessage(err.message || "Something went wrong.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToastMessage("Please select an image file", "danger");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToastMessage("Image must be less than 5MB", "danger");
      return;
    }

    setIsUploading(true);

    try {
      if (!user?.id) throw new Error("User ID not available");

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

      const base64Data = await toBase64(file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64Data }),
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await uploadRes.json();

      const updateRes = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile image");

      const updatedUser = await updateRes.json();
      await update({ user: updatedUser.user });

      setImagePreview(updatedUser.user.image);
      showToastMessage("Profile image updated successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      showToastMessage(error.message || "Failed to upload image.", "danger");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!isOwnProfile) return;
    try {
      if (!user?.id) throw new Error("User ID not available");

      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });

      if (!response.ok) throw new Error("Failed to remove profile image");

      setImagePreview("");
      showToastMessage("Profile image removed successfully!");
    } catch (error: any) {
      console.error("Error removing image:", error);
      showToastMessage(error.message || "Failed to remove image.", "danger");
    }
  };

  const handleFollowClick = () => {
    const now = Date.now();
    if (now - lastFollowClick.current < 500) return; // cooldown 500ms
    lastFollowClick.current = now;
    toggleFollow();
  };

  return (
    <>
      <Card className={`${styles.profileCard} shadow-sm mb-4`}>
       <Card.Body className="p-4">
    {/* Avatar area */}
    <div className={`d-flex flex-column align-items-center text-center mb-3 position-relative ${styles.header}`}>
      <div className={styles.avatarWrap}>
        <Image
          src={imagePreview || "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"}
          alt={user.name || "User"}
          width={120}
          height={120}
          className={`${styles.avatar} rounded-circle`}
        />

        {isOwnProfile && (
          <>
            <Button
              variant="primary"
              size="sm"
              className={`${styles.uploadBtn} position-absolute`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Spinner size="sm" /> : <CloudUpload size={14} />}
            </Button>

            {user?.image && (
              <Button
                variant="danger"
                size="sm"
                className={`${styles.removeBtn} position-absolute`}
                onClick={removeImage}
                disabled={isUploading}
              >
                <X size={12} />
              </Button>
            )}
          </>
        )}
      </div>
    </div>

    {/* Name & handle */}
    <h2 className={`${styles.name} h5 mt-3 mb-1`}>{user?.name || "Guest User"}</h2>
    <p className={`${styles.handle} text-muted mb-2`}>@{user?.email?.split("@")[0] || "guest"}</p>
    {user?.bio && <p className={`${styles.bio} text-center fst-italic`}>{user.bio}</p>}

    {/* Followers / Following counts (clickable) */}
    <div className="d-flex justify-content-center gap-3 mt-3">
      <button
        type="button"
        className={`btn btn-link text-decoration-none ${styles.countBtn}`}
        onClick={() => setShowFollowersModal(true)}
      >
        <span className={`badge ${styles.countBadge}`}>
          {followersCount !== null ? followersCount : <Spinner animation="border" size="sm" />}
        </span>
        <div className="small text-muted">Followers</div>
      </button>

      <button
        type="button"
        className={`btn btn-link text-decoration-none ${styles.countBtn}`}
        onClick={() => setShowFollowingModal(true)}
      >
        <span className={`badge ${styles.countBadge}`}>
          {followingCount !== null ? followingCount : <Spinner animation="border" size="sm" />}
        </span>
        <div className="small text-muted">Following</div>
      </button>
    </div>

    {/* Edit or Follow button */}
    <div className="d-flex justify-content-center mt-3">
      {isOwnProfile ? (
        <Button
          variant="primary"
          size="sm"
          className={styles.editBtn}
          onClick={() => setShowEdit(true)}
          disabled={isSaving}
        >
          Edit Profile
        </Button>
      ) : (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{isFollowing ? "Click to unfollow" : "Click to follow"}</Tooltip>}
        >
          <Button
            className={`${styles.followBtn} ${isFollowing ? "btn-outline-danger" : "btn-primary"}`}
            size="sm"
            onClick={handleFollowClick}
            disabled={loading}
          >
            {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </Button>
        </OverlayTrigger>
      )}
    </div>
  </Card.Body>

        {/* Edit Modal */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" value={formData.name} onChange={handleChange("name")} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange("bio")} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control name="location" value={formData.location} onChange={handleChange("location")} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Website</Form.Label>
                <Form.Control name="website" value={formData.website} onChange={handleChange("website")} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" animation="border" /> : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>

        <FollowersModal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} list={followersList} title="Followers" />
        <FollowersModal show={showFollowingModal} onHide={() => setShowFollowingModal(false)} list={followingList} title="Following" />
      </Card>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Header className={`bg-${toastVariant} text-white`}>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

// Followers / Following modal component
export function FollowersModal({
  show,
  onHide,
  list,
  title,
}: FollowersModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {list.length === 0 ? (
          <p className="text-center text-muted">No {title.toLowerCase()} yet</p>
        ) : (
          list.map((f: any) => {
            const u = f.follower || f.following;
            return (
              <Link
                key={u._id}
                href={`/profile/${u._id}`}
                className="d-flex align-items-center mb-2 text-decoration-none text-dark"
                onClick={onHide} // close modal when navigating
              >
                <Image
                  src={
                    u.image ||
                    "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"
                  }
                  alt={u.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-circle me-2"
                />
                <span>{u.name}</span>
              </Link>
            );
          })
        )}
      </Modal.Body>
    </Modal>
  );
}
