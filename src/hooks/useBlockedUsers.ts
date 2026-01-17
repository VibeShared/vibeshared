import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blocked"],
    queryFn: async () => {
      const res = await fetch("/api/settings/block");
      if (!res.ok) {
        throw new Error("Failed to load blocked users");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/settings/block", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to unblock user");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked"] });
    },
  });
}
