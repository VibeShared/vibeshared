import { NextApiRequest, NextApiResponse } from 'next';
import connectdb from '@/lib/Connect';
import Post, { IPost as PostType } from "@/lib/models/Post";
import mongoose, { Types } from 'mongoose';

interface CreatePostRequest {
  userId: string | Types.ObjectId;
  content?: string;
  mediaUrl?: string;
}

interface PostResponse extends Omit<PostType, 'userId'> {
  userId: {
    _id: Types.ObjectId;
    username?: string;
    email?: string;
    // Add other user fields you populate
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostType | PostResponse[] | { error: string }>
) {
  await mongoose.connect(connectdb)

  if (req.method === "POST") {
    try {
      const { userId, content, mediaUrl } = req.body as CreatePostRequest;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const post = new Post({ 
        userId, 
        content: content || '', 
        mediaUrl: mediaUrl || '' 
      });
      await post.save();
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  }

  if (req.method === "GET") {
    try {
      const posts = await Post.find()
        .populate<{ userId: { _id: Types.ObjectId; username?: string; email?: string } }>(
          "userId", 
          "username email"
        )
        .sort({ createdAt: -1 })
        .exec();
      
      return res.status(200).json(posts as PostResponse[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}