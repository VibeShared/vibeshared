"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { useComments } from "@/hooks/useComments";
import { MemoCommentItem, Comment } from "./CommentItem"; // Import Comment Type
import { Send } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const { commentsQuery, addComment, deleteComment } = useComments(postId);
  const [mainCommentText, setMainCommentText] = useState("");

  // 1. Get all flat comments from React Query pages
  const flatComments = commentsQuery.data?.pages.flatMap((p) => p.comments) ?? [];

  // 2. ✅ LOGIC FIX: Convert Flat List to Tree Structure
  const rootComments = useMemo(() => {
    const commentMap: Record<string, Comment> = {};
    const roots: Comment[] = [];

    // Clone objects to avoid mutation issues and create a Map
    flatComments.forEach((c) => {
      commentMap[c._id] = { ...c, replies: [] }; // Initialize empty replies array
    });

    // Assemble the Tree
    flatComments.forEach((c) => {
      if (c.parentId && commentMap[c.parentId]) {
        // If it has a parent, push to parent's replies
        commentMap[c.parentId].replies!.push(commentMap[c._id]);
      } else {
        // If no parent (or parent not loaded yet), it's a root (for now)
        // Note: Only strict root comments (parentId: null) should be treated as roots
        if(!c.parentId) {
             roots.push(commentMap[c._id]);
        }
      }
    });

    // Sort replies by time (Oldest first usually looks better inside a thread)
    Object.values(commentMap).forEach(c => {
        c.replies?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    // Sort roots by newest first
    return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [flatComments]);


  // 🔹 Scroll after successful comment
useEffect(() => {
  if (addComment.isSuccess) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [addComment.isSuccess]);

// 🔹 Pusher realtime updates
useEffect(() => {
  const channel = pusherClient.subscribe(`comments-${postId}`);

  const handleUpdate = () => {
    commentsQuery.refetch();
  };

  channel.bind("new-comment", handleUpdate);
  channel.bind("delete-comment", handleUpdate);

  return () => {
    channel.unbind("new-comment", handleUpdate);
    channel.unbind("delete-comment", handleUpdate);
    pusherClient.unsubscribe(`comments-${postId}`);
  };
}, [postId]);


  const handleMainSubmit = () => {
    if (!mainCommentText.trim()) return;
    addComment.mutate({ postId, text: mainCommentText }); // No parentId for main comments
    setMainCommentText("");
  };

  const handleReplySubmit = useCallback((text: string, parentId: string) => {
      addComment.mutate({ postId, text, parentId });
  }, [addComment, postId]);

  const handleDelete = useCallback((commentId: string) => {
    deleteComment.mutate({ commentId });
  }, [deleteComment]);

  if (commentsQuery.isLoading) return <div className="p-4 text-center text-muted">Loading comments...</div>;

  return (
    <div className="mt-3">
      {/* Main Input Box */}
      <div className="d-flex gap-2 mb-4">
        <input
          className="form-control"
          placeholder="Write a comment..."
          value={mainCommentText}
          onChange={(e) => setMainCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleMainSubmit()}
        />
        <button
          className="btn btn-primary"
          onClick={handleMainSubmit}
          disabled={addComment.isPending || !mainCommentText.trim()}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Render Root Comments Only (Recursion handles the rest) */}
      <div className="d-flex flex-column gap-3">
        {rootComments.map((comment) => (
          <MemoCommentItem
            key={comment._id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={handleReplySubmit}
            onDelete={handleDelete}
          />
        ))}
        
        {rootComments.length === 0 && (
            <div className="text-center text-muted my-3">No comments yet. Be the first!</div>
        )}
      </div>

      {commentsQuery.hasNextPage && (
        <button
          className="btn btn-outline-secondary btn-sm mt-3 w-100"
          onClick={() => commentsQuery.fetchNextPage()}
          disabled={commentsQuery.isFetchingNextPage}
        >
          {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more comments"}
        </button>
      )}
    </div>
  );
}