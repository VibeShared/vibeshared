"use client";

import { useCallback, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { useComments } from "@/hooks/useComments";
import { MemoCommentItem } from "./CommentItem";
import { Send } from "lucide-react"; // Make sure to import icon

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const { commentsQuery, addComment, deleteComment } = useComments(postId);
  const [mainCommentText, setMainCommentText] = useState("");

  const comments = commentsQuery.data?.pages.flatMap((p) => p.comments) ?? [];

  useEffect(() => {
    const channel = pusherClient.subscribe(`comments-${postId}`);

    const handleUpdate = () => {
        commentsQuery.refetch();
    };

    channel.bind("new-comment", handleUpdate);
    channel.bind("delete-comment", handleUpdate);

    return () => {
      pusherClient.unsubscribe(`comments-${postId}`);
      channel.unbind_all(); // Good practice to unbind
    };
  }, [postId, commentsQuery]);

  const handleSubmit = useCallback(
    (text: string, parentId?: string) => {
      // ✅ FIX: Pass currentUserId to the mutation
      addComment.mutate({ 
        userId: currentUserId, 
        postId, 
        text, 
        parentId 
      });
    },
    [addComment, postId, currentUserId]
  );

  const handleMainSubmit = () => {
      if(!mainCommentText.trim()) return;
      handleSubmit(mainCommentText);
      setMainCommentText("");
  }

  // ✅ FIX: Pass userId to the delete mutation
  const handleDelete = useCallback((commentId: string) => {
      deleteComment.mutate({ commentId, userId: currentUserId });
  }, [deleteComment, currentUserId]);

  if (commentsQuery.isLoading) return <div>Loading comments…</div>;

  return (
    <div className="mt-3">
      {/* ✅ Added a main input box for top-level comments */}
      <div className="d-flex gap-2 mb-4">
          <input 
            className="form-control"
            placeholder="Write a comment..."
            value={mainCommentText}
            onChange={(e) => setMainCommentText(e.target.value)}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleMainSubmit}
            disabled={addComment.isPending}
          >
             <Send size={18} />
          </button>
      </div>

      <div className="d-flex flex-column gap-3">
        {comments.map((comment) => (
          <MemoCommentItem
            key={comment._id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={handleSubmit}
            onDelete={handleDelete} // Use the new handler that includes userId
          />
        ))}
      </div>

      {commentsQuery.hasNextPage && (
        <button
          className="btn btn-outline-secondary btn-sm mt-3"
          onClick={() => commentsQuery.fetchNextPage()}
        >
          {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}