import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { IPost } from "./Post";
import { IUser } from "./User";

export interface ILike extends Document {
  userId: IUser["_id"];
  postId: IPost["_id"];
  createdAt: Date;
}

const LikeSchema: Schema<ILike> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate likes from same user
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);
