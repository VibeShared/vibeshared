"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, ProfileFormValues } from "./profile.schema";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ProfileForm() {
  const { data } = useMe();
  const user = data?.user;
  const { update } = useSession();

  const mutation = useProfileSettings();

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
    }
  }, [user, form]);

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
            image: res.user.image,
            username: res.user.username,
          },
        });

        toast.success("Profile updated");

        if (res.usernameError) {
          toast.error(res.usernameError);
        }
      },
      onError: (e: any) => {
        const message =
          e?.response?.data?.error ?? e?.message ?? "Something went wrong";

        toast.error(
          typeof message === "string" ? message : "Invalid input data"
        );
      },
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="card p-4">
      <h5 className="mb-4">Profile</h5>

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

      {/* Bio */}
      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea className="form-control" rows={3} {...form.register("bio")} />
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
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
