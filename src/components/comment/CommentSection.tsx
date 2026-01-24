"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { useComments } from "@/hooks/useComments";
import { MemoCommentItem, Comment } from "./CommentItem";
import { Send, Loader2 } from "lucide-react"; // Loader icon for better UX

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  // 1. Hook se editComment mutation bhi nikal lo
  const { commentsQuery, addComment, deleteComment, editComment } = useComments(postId);
  const [mainCommentText, setMainCommentText] = useState("");

  const flatComments = commentsQuery.data?.pages.flatMap((p) => p.comments) ?? [];

  // ✅ Tree Structure Logic (Same as yours, optimized)
  const rootComments = useMemo(() => {
    const commentMap: Record<string, Comment> = {};
    const roots: Comment[] = [];

    flatComments.forEach((c) => {
      commentMap[c._id] = { ...c, replies: [] };
    });

    flatComments.forEach((c) => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies!.push(commentMap[c._id]);
      } else if (!c.parentId) {
        roots.push(commentMap[c._id]);
      }
    });

    // Nested sorting
    Object.values(commentMap).forEach(c => {
      c.replies?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [flatComments]);

  // 🔹 Pusher Realtime Updates (Added 'edit-comment' binding)
  useEffect(() => {
    const channel = pusherClient.subscribe(`comments-${postId}`);

    const handleUpdate = () => {
      commentsQuery.refetch();
    };

    channel.bind("new-comment", handleUpdate);
    channel.bind("delete-comment", handleUpdate);
    channel.bind("edit-comment", handleUpdate); // 🔥 Add this for realtime edits

    return () => {
      channel.unbind_all(); // Clean way to unbind
      pusherClient.unsubscribe(`comments-${postId}`);
    };
  }, [postId, commentsQuery]);

  // 🔹 Handlers
  const handleMainSubmit = () => {
    if (!mainCommentText.trim()) return;
    addComment.mutate({ postId, text: mainCommentText });
    setMainCommentText("");
  };

  const handleReplySubmit = useCallback((text: string, parentId: string) => {
    addComment.mutate({ postId, text, parentId });
  }, [addComment, postId]);

  const handleDelete = useCallback((commentId: string) => {
    deleteComment.mutate({ commentId });
  }, [deleteComment]);

  // ✅ New Edit Handler
  const handleEdit = useCallback((commentId: string, text: string) => {
    editComment.mutate({ commentId, text });
  }, [editComment]);

  if (commentsQuery.isLoading) return <div className="p-4 text-center text-muted">Loading comments...</div>;

  return (
    <div className="mt-3 container-fluid px-0">
      {/* Main Input Box */}
      <div className="d-flex gap-2 mb-4 sticky-bottom bg-white p-2 border-top shadow-sm d-md-none" 
           style={{ zIndex: 10, bottom: 0 }}>
         {/* Mobile par input box niche sticky hona chahiye, ye ek option hai */}
      </div>

      <div className="d-flex gap-2 mb-4">
        <input
          className="form-control shadow-sm"
          placeholder="Write a comment..."
          value={mainCommentText}
          onChange={(e) => setMainCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleMainSubmit()}
          style={{ borderRadius: "20px" }}
        />
        <button
          className="btn btn-primary rounded-circle"
          onClick={handleMainSubmit}
          disabled={addComment.isPending || !mainCommentText.trim()}
        >
          {addComment.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>

      {/* Comment List */}
      <div className="d-flex flex-column gap-3">
        {rootComments.map((comment) => (
          <MemoCommentItem
            key={comment._id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={handleReplySubmit}
            onDelete={handleDelete}
            onEdit={handleEdit} // ✅ Passing Edit Prop
          />
        ))}
        
        {rootComments.length === 0 && (
            <div className="text-center text-muted my-5">No comments yet. Start the conversation!</div>
        )}
      </div>

      {/* Infinite Scroll Button */}
      {commentsQuery.hasNextPage && (
        <button
          className="btn btn-link text-decoration-none btn-sm mt-3 w-100 text-muted fw-bold"
          onClick={() => commentsQuery.fetchNextPage()}
          disabled={commentsQuery.isFetchingNextPage}
        >
          {commentsQuery.isFetchingNextPage ? "Loading more..." : "Show more comments"}
        </button>
      )}
    </div>
  );
}