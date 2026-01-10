"use client";

import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4">
      <div>
        <div className="fw-semibold">{label}</div>
        <div className="text-muted small">{description}</div>
      </div>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    </div>
  );
}

export default function NotificationsForm() {
  const { data } = useMe();
  const user = data?.user;

  const mutation = useNotificationSettings();

  if (!user) return null;

  const update = (payload: any) => {
    mutation.mutate(payload, {
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="card p-4">
      <h5 className="mb-4">Notifications</h5>

      <ToggleRow
        label="Likes"
        description="Get notified when someone likes your post."
        checked={user.notificationLikes}
        onChange={(v) => update({ notificationLikes: v })}
      />

      <ToggleRow
        label="Comments"
        description="Get notified when someone comments on your post."
        checked={user.notificationComments}
        onChange={(v) => update({ notificationComments: v })}
      />

      <ToggleRow
        label="New followers"
        description="Get notified when someone follows you."
        checked={user.notificationFollows}
        onChange={(v) => update({ notificationFollows: v })}
      />
    </div>
  );
}
