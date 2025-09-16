// lib/models/Post.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  username?: string;
  email?: string;
  name?: string;
}

export interface IPost extends Document {
  userId: Types.ObjectId | IUser;
  content: string;
   cloudinary_id?: string; 
  mediaUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  cloudinary_id: String, 
  content: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);