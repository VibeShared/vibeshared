import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";

export interface ILike extends Document {
  userId: IUser["_id"];
  postId: IPost["_id"];
  createdAt: Date;
  likesCount : number
}

const LikeSchema: Schema<ILike> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now },
    likesCount: {            // ✅ add this
    type: Number,
    default: 0,
  }
  },
  { timestamps: true }
);

// Prevent duplicate likes from same user
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);
