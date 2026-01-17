"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, ProfileFormValues } from "./profile.schema";
import uploadProfileImage from "./uploadProfileImage";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { CloudUpload } from "react-bootstrap-icons";


export default function ProfileForm() {
  const { data } = useMe();
  const user = data?.user;
  const { update } = useSession();

  const mutation = useProfileSettings();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  const bioValue = form.watch("bio") || "";

  /* Hydrate from /api/me */
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      });
      setImagePreview(user.image || null);
    }
  }, [user, form]);

  /* Image Upload */
  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);

      const url = await uploadProfileImage(file);

      await mutation.mutateAsync({ image: url });

      setImagePreview(url);
      await update({ user: { image: url } });

      toast.success("Profile image updated");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  /* Submit Profile */
  const onSubmit = (values: ProfileFormValues) => {
    if (!user) return;

    const payload: Partial<ProfileFormValues> = {};

    (["name", "username", "bio", "location", "website"] as const).forEach(
      (key) => {
        if (values[key] !== user[key]) {
          payload[key] = values[key];
        }
      }
    );

    if (Object.keys(payload).length === 0) {
      toast("No changes to save");
      return;
    }

    mutation.mutate(payload, {
      onSuccess: async (res: any) => {
        await update({
          user: {
            name: res.user.name,
            username: res.user.username,
            image: res.user.image,
          },
        });

        toast.success("Profile updated");

        if (res.usernameError) {
          toast.error(res.usernameError);
        }
      },
      onError: () => {
        toast.error("Invalid input data");
      },
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="card p-4">
      <h5 className="mb-4">Profile</h5>

      {/* Profile Image */}
<div className="mb-4">
  <label className="form-label">Profile Image</label>

  <div className="d-flex align-items-center gap-3">
    <img
      src={imagePreview || "/avatar.png"}
      alt="Profile"
      width={64}
      height={64}
      className="rounded-circle border"
    />

    <label
      className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${
        imageUploading ? "disabled" : ""
      }`}
      style={{ cursor: imageUploading ? "not-allowed" : "pointer" }}
    >
      <CloudUpload size={18} />
      {imageUploading ? "Uploading..." : "Upload"}

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={onImageChange}
        disabled={imageUploading}
      />
    </label>
  </div>

  <small className="form-text text-sm">
     Max 5MB
  </small>
</div>


      {/* Name */}
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input className="form-control" {...form.register("name")} />
      </div>

      {/* Username */}
      <div className="mb-3">
        <label className="form-label">Username</label>
        <input className="form-control" {...form.register("username")} />
        <div className="form-text">
          Username changes are limited for security reasons.
        </div>
      </div>

      {/* Bio with Counter */}
      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea
          className="form-control"
          rows={3}
          maxLength={200}
          {...form.register("bio")}
        />
        <div className="form-text text-end">
          {bioValue.length}/200
        </div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">Location</label>
        <input className="form-control" {...form.register("location")} />
      </div>

      {/* Website */}
      <div className="mb-4">
        <label className="form-label">Website</label>
        <input className="form-control" {...form.register("website")} />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={mutation.isPending || imageUploading}
      >
        {mutation.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
