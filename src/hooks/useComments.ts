import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AddCommentPayload {
  userId: string;
  postId: string;
  text: string;
  parentId?: string;
}

interface DeleteCommentPayload {
  commentId: string;
  userId: string;
}

export function useComments(postId: string) {
  const queryClient = useQueryClient();

  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/comments?postId=${postId}&page=${pageParam}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 60_000,
  });

  const addComment = useMutation({
    // ✅ Updated to accept explicit payload type
    mutationFn: async (payload: AddCommentPayload) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteComment = useMutation({
    // ✅ Updated to accept object with commentId AND userId
    mutationFn: async (payload: DeleteCommentPayload) => {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  return {
    commentsQuery,
    addComment,
    deleteComment,
  };
}