// src\componenets\ProfileCard\ProfilePersonal.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { CloudUpload, X } from "react-bootstrap-icons";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Session } from "next-auth";

interface ProfileCardClientProps {
  session: Session | null;
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
  user: UserProfile; // 👈 passed from page
  isOwnProfile?: boolean; // 👈 true if viewing your own profile
}

export default function ProfileCard({
  user,
  isOwnProfile = false,
}: ProfileCardProps) {
 const { update } = useSession(); // ✅ only use update when saving changes

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastApiCallRef = useRef<number>(0);

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
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setImagePreview(user.image || "");
  }, [user.id]); // ✅ updates when a different profile is loaded

  const showToastMessage = useCallback((message: string, variant: "success" | "danger" = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  }, []);





 const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);


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

      await res.json();

      if (update) await update();
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

    // 1️⃣ Validate file
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

      // 2️⃣ Convert file to base64
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

      const base64Data = await toBase64(file);

      // 3️⃣ Upload to Cloudinary via /api/upload
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

      // 4️⃣ Update backend profile
      const updateRes = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile image");

      const updatedUser = await updateRes.json();

      // 5️⃣ Update NextAuth session
      await update({ user: updatedUser.user });

      // 6️⃣ Update UI immediately
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
      if (!user?.id) {
        throw new Error("User ID not available");
      }

      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove profile image");
      }

      // Update session with removed image
     
      setImagePreview("");
      showToastMessage("Profile image removed successfully!");
    } catch (error: any) {
      console.error("Error removing image:", error);
      showToastMessage(
        error.message || "Failed to remove image. Please try again.",
        "danger"
      );
    }
  };
  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          {/* Avatar */}
          <div className="d-flex flex-column align-items-center text-center mb-3 position-relative">
            <div className="position-relative">
               <Image
                src={imagePreview || "/default-avatar.png"}
                alt={user.name || "User"}
                width={120}
                height={120}
                unoptimized
                className="rounded-circle"
              />
              {isOwnProfile && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0 rounded-circle p-1"
                    style={{ width: "32px", height: "32px" }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Spinner size="sm" />
                    ) : (
                      <CloudUpload size={14} />
                    )}
                  </Button>
                  {user?.image && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle p-1"
                      style={{ width: "28px", height: "28px" }}
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

          <h2 className="h5 mt-3 mb-1">{user?.name || "Guest User"}</h2>
          <p className="text-muted mb-2">@{user?.email?.split("@")[0] || "guest"}</p>
          {user?.bio && <p className="text-center fst-italic">{user.bio}</p>}

          {isOwnProfile && (
            <div className="d-flex justify-content-center gap-2">
              <Button variant="primary" size="sm" onClick={() => setShowEdit(true)} disabled={isSaving}>
                Edit Profile
              </Button>
            </div>
          )}
        </Card.Body>

        <Modal
          show={showEdit}
          onHide={() => !isSaving && setShowEdit(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={isSaving}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  maxLength={200}
                  disabled={isSaving}
                />
                <Form.Text className="text-muted">
                  {formData.bio.length}/200 characters
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  disabled={isSaving}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                  disabled={isSaving}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowEdit(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1060 }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header className={`bg-${toastVariant} text-white`}>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
