"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrivacySchema, PrivacyFormValues } from "./privacy.schema";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";

export default function PrivacyForm() {
  const { data } = useMe();
  const user = data?.user;

  const mutation = usePrivacySettings();

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(PrivacySchema),
    defaultValues: {
      isPrivate: false,
    },
  });

  /* Hydrate from /api/me */
  useEffect(() => {
    if (user) {
      form.reset({
        isPrivate: !!user.isPrivate,
      });
    }
  }, [user, form]);

  const onSubmit = (values: PrivacyFormValues) => {
    const payload: Partial<PrivacyFormValues> = {};

    if (values.isPrivate !== user?.isPrivate) {
      payload.isPrivate = values.isPrivate;
    }

    if (Object.keys(payload).length === 0) {
      toast("No changes to save");
      return;
    }

    mutation.mutate(payload, {
      onSuccess: () => toast.success("Privacy settings updated"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="card p-4">
      <h5 className="mb-4">Privacy</h5>

      {/* Private Account */}
      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="isPrivate"
          {...form.register("isPrivate")}
        />
        <label className="form-check-label" htmlFor="isPrivate">
          Private account
        </label>
        <div className="form-text">
          When enabled, only approved followers can see your posts.
        </div>
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
