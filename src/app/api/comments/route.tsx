import type { NextApiRequest, NextApiResponse } from "next";
import  connectdb  from "@/lib/Connect";
import { Comment, IComment } from "@/lib/models/Comment";
import { mongo, Types } from "mongoose";
import mongoose from "mongoose";

// Type definitions
interface CreateCommentRequest {
  userId: string;
  postId: string;
  text: string;
}

interface DeleteCommentRequest {
  commentId: string;
  userId: string;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  image?: string;
  // Add other user fields you might want to populate
}

interface PopulatedComment extends Omit<IComment, 'userId'> {
  userId: PopulatedUser;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IComment | PopulatedComment[] | { message: string } | ErrorResponse>
) {
  await mongoose.connect(connectdb);

  if (req.method === "POST") {
    try {
      const { userId, postId, text } = req.body as CreateCommentRequest;

      if (!userId || !postId || !text) {
        return res.status(400).json({ error: "Missing required fields: userId, postId, and text are required" });
      }

      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid userId or postId format" });
      }

      if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: "Comment text cannot be empty" });
      }

      if (text.length > 1000) {
        return res.status(400).json({ error: "Comment cannot exceed 1000 characters" });
      }

      const comment = await Comment.create({ 
        userId: new Types.ObjectId(userId), 
        postId: new Types.ObjectId(postId), 
        text: text.trim() 
      });
      
      // Populate the newly created comment to return user data
      const populatedComment = await Comment.findById(comment._id)
        .populate<{ userId: PopulatedUser }>("userId", "name image")
        .exec();

      return res.status(201).json(populatedComment as PopulatedComment);

    } catch (error) {
      console.error("Create Comment error:", error);
      return res.status(500).json({ error: "Failed to create comment" });
    }
  }

  if (req.method === "GET") {
    try {
      const { postId } = req.query;

      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Post ID is required and must be a single value" });
      }

      if (!Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid Post ID format" });
      }

      const comments = await Comment.find({ postId: new Types.ObjectId(postId) })
        .populate<{ userId: PopulatedUser }>("userId", "name image")
        .sort({ createdAt: -1 })
        .exec();

      return res.status(200).json(comments as PopulatedComment[]);

    } catch (error) {
      console.error("Fetch Comments error:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { commentId, userId } = req.body as DeleteCommentRequest;

      if (!commentId || !userId) {
        return res.status(400).json({ error: "commentId and userId are required" });
      }

      if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid commentId or userId format" });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if ((comment.userId as Types.ObjectId).toString() !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this comment" });
      }

      await Comment.deleteOne({ _id: commentId });
      return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
      console.error("Delete Comment error:", error);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  }

  res.setHeader("Allow", ["POST", "GET", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}