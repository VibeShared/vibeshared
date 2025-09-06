import mongoose from "mongoose";
import { Document, Types } from 'mongoose';

export interface IPost extends Document {
  userId: Types.ObjectId;
  content?: string; // Made optional since it's just "String" in schema
  mediaUrl?: string; // Made optional since it's just "String" in schema
  createdAt: Date;
}



const PostSchema = new mongoose.Schema<IPost>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  mediaUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
