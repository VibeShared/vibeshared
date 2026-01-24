//src/hooks/useComments.ts
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

interface AddCommentPayload {
  postId: string;
  text: string;
  parentId?: string;
}

interface DeleteCommentPayload {
  commentId: string;
}

export function useComments(postId: string) {
  const queryClient = useQueryClient();

  /* =========================
     FETCH COMMENTS (CURSOR)
  ========================= */
  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    initialPageParam: null as string | null,

    queryFn: async ({ pageParam }) => {
  const url = new URL("/api/comments", window.location.origin);
  url.searchParams.set("postId", postId);
  url.searchParams.set("limit", "10");

  if (pageParam) {
    url.searchParams.set("cursor", pageParam);
  }

  const res = await fetch(url.toString(), {
    credentials: "include", // 🔥 THIS WAS MISSING
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to fetch comments");
  }

  return json.data as {
    comments: any[];
    nextCursor: string | null;
  };
},


    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
  });

  /* =========================
     ADD COMMENT
  ========================= */
  const addComment = useMutation({
  mutationFn: async (payload: AddCommentPayload) => {
    const res = await fetch("/api/comments", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to post comment");
    }

    return json.data;
  },

  onMutate: async (newComment) => {
    await queryClient.cancelQueries({ queryKey: ["comments", postId] });

    const previousData = queryClient.getQueryData(["comments", postId]);

    queryClient.setQueryData(["comments", postId], (old: any) => {
      if (!old) return old;

      // add new comment to FIRST page
      old.pages[0].comments.unshift({
        ...newComment,
        _id: "temp-" + Date.now(),
        createdAt: new Date().toISOString(),
      });

      return { ...old };
    });

    return { previousData };
  },

  onError: (_err, _newTodo, context) => {
    queryClient.setQueryData(["comments", postId], context?.previousData);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  },
});



  /* =========================
     DELETE COMMENT
  ========================= */
  const deleteComment = useMutation({
    mutationFn: async ({ commentId }: DeleteCommentPayload) => {
      const res = await fetch("/api/comments", {
        credentials: "include",
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete comment");
      }

      return json.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
    },
  });

  return {
    commentsQuery,
    addComment,
    deleteComment,
  };
}
