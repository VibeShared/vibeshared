import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";

export interface IComment extends Document {
  userId: IUser["_id"];
  postId: IPost["_id"];
  parentId?: IComment["_id"] | null; // NEW: for replies
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, 
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: "Post", 
      required: true 
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = top-level comment
    },
    text: { 
      type: String, 
      required: true, 
      trim: true,
      maxLength: 1000
    },
  },
  { 
    timestamps: true 
  }
);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
