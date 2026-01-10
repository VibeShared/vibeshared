import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      isPrivate?: boolean;
      commentPermission?: "everyone" | "followers";
    }) => {
      const res = await fetch("/api/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to update privacy settings");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
