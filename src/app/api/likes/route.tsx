import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectdb from "@/lib/Connect";
import { Like, ILike } from "@/lib/models/Likes";
import Post from "@/lib/models/Post";
import { Types } from "mongoose";

// Type definitions
interface LikeRequest {
  userId: string;
  postId: string;
}

interface LikeResponse {
  message?: string;
  like?: ILike;
  error?: string;
}

interface LikesCountResponse {
  count: number;
  users: ILike[];
  error?: string;
}

interface PopulatedLikeUser {
  _id: Types.ObjectId;
  name?: string;
  image?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LikeResponse | LikesCountResponse | { error: string }>
) {
  try {
    await mongoose.connect(connectdb);
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({ error: "Database connection failed" });
  }

  if (req.method === "POST") {
    try {
      const { userId, postId } = req.body as LikeRequest;

      // Validation
      if (!userId || !postId) {
        return res.status(400).json({ error: "User ID and Post ID are required" });
      }

      // Validate ObjectId format
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid User ID or Post ID format" });
      }

      // Check if post exists
      const postExists = await Post.findById(postId);
      if (!postExists) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if like exists
      const existingLike = await Like.findOne({ userId, postId });

      if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
        
        // Optionally update post like count if you have that field
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
        
        return res.status(200).json({ message: "Post unliked" });
      }

      // Like
      const like = await Like.create({ userId, postId });
      
      // Optionally update post like count if you have that field
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      
      return res.status(201).json({ like });

    } catch (error) {
      console.error("Like API error:", error);
      return res.status(500).json({ error: "Failed to like/unlike post" });
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

      const likes = await Like.find({ postId })
        .populate<{ userId: PopulatedLikeUser }>("userId", "name image")
        .exec();

      return res.status(200).json({ 
        count: likes.length, 
        users: likes 
      });

    } catch (error) {
      console.error("Get Likes error:", error);
      return res.status(500).json({ error: "Failed to fetch likes" });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}