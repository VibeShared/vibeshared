import mongoose, { Document, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  username?: string;
  email?: string;
  name?: string;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  content: string;
  cloudinary_id?: string;
  mediaUrl: string;
  likesCount: number;        // ✅ total likes
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cloudinary_id: String,
    content: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    likesCount: { type: Number, default: 0 }, // ✅ initialize likes count
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ userId: 1 });
export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
