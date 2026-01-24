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

interface EditCommentPayload {
  commentId: string;
  text: string;
}

interface DeleteCommentPayload {
  commentId: string;
}

export function useComments(postId: string) {
  const queryClient = useQueryClient();

  /* =========================
     FETCH COMMENTS (INFINITE)
  ========================= */
  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const url = new URL("/api/comments", window.location.origin);
      url.searchParams.set("postId", postId);
      url.searchParams.set("limit", "15"); // Mobile ke liye 15-20 optimal hai
      if (pageParam) url.searchParams.set("cursor", pageParam);

      const res = await fetch(url.toString(), { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      return json.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000, // 30 seconds tak data fresh mana jayega
  });

  /* =========================
     ADD COMMENT (OPTIMISTIC)
  ========================= */
  const addComment = useMutation({
    mutationFn: async (payload: AddCommentPayload) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  /* =========================
     EDIT COMMENT (NEW!) ✏️
  ========================= */
  const editComment = useMutation({
    mutationFn: async (payload: EditCommentPayload) => {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    // Optimistic Update: API response se pehle UI update kar do
    onMutate: async (updatedComment) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousData = queryClient.getQueryData(["comments", postId]);

      queryClient.setQueryData(["comments", postId], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          comments: page.comments.map((c: any) =>
            c._id === updatedComment.commentId ? { ...c, text: updatedComment.text, isEdited: true } : c
          ),
        })),
      }));
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousData);
    },
  });

  /* =========================
     DELETE COMMENT (OPTIMISTIC)
  ========================= */
  const deleteComment = useMutation({
    mutationFn: async ({ commentId }: DeleteCommentPayload) => {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      return commentId;
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousData = queryClient.getQueryData(["comments", postId]);

      // UI se turant hata do (Soft delete ya Cascade delete ke hisaab se)
      queryClient.setQueryData(["comments", postId], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          comments: page.comments.map((c: any) =>
            c._id === commentId ? { ...c, isDeleted: true, text: "This comment has been deleted" } : c
          ),
        })),
      }));
      return { previousData };
    },
  });

  return { commentsQuery, addComment, editComment, deleteComment };
}