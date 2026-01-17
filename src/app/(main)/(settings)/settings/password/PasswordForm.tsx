"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordSchema, PasswordFormValues } from "./password.schema";
import { usePasswordChange } from "@/hooks/usePasswordChange";
import toast from "react-hot-toast";

export default function PasswordForm() {
  const mutation = usePasswordChange();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    mutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated. Please log in again.");
          form.reset();

          // optional: redirect to login after logout
          // signOut({ callbackUrl: "/login" });
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="card p-4">
      <h5 className="mb-4">Change Password</h5>

      {/* Current Password */}
      <div className="mb-3">
        <label className="form-label">Current password</label>
        <input
          type="password"
          className="form-control"
          {...form.register("currentPassword")}
        />
        <small className="text-danger">
          {form.formState.errors.currentPassword?.message}
        </small>
      </div>

      {/* New Password */}
      <div className="mb-3">
        <label className="form-label">New password</label>
        <input
          type="password"
          className="form-control"
          {...form.register("newPassword")}
        />
        <small className="text-danger">
          {form.formState.errors.newPassword?.message}
        </small>
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label className="form-label">Confirm new password</label>
        <input
          type="password"
          className="form-control"
          {...form.register("confirmPassword")}
        />
        <small className="text-danger">
          {form.formState.errors.confirmPassword?.message}
        </small>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Updating..." : "Update password"}
      </button>

      <div className="form-text mt-3">
        Changing your password will log you out of other sessions.
      </div>
    </form>
  );
}
