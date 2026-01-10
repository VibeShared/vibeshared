import { useMutation, useQueryClient } from "@tanstack/react-query";

type Payload = Partial<{
  notificationLikes: boolean;
  notificationComments: boolean;
  notificationFollows: boolean;
}>;

export function useNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to update notifications");
      }

      return res.json();
    },

    // 🔥 Optimistic update
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["me"] });

      const previous = queryClient.getQueryData<any>(["me"]);

      queryClient.setQueryData(["me"], (old: any) => {
        if (!old?.user) return old;

        return {
          ...old,
          user: {
            ...old.user,
            ...payload,
          },
        };
      });

      return { previous };
    },

    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["me"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
