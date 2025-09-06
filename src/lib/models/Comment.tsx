import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";

export interface IComment extends Document {
  userId: IUser["_id"];
  postId: IPost["_id"];
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
    text: { 
      type: String, 
      required: true, 
      trim: true,
      maxLength: 1000 // Added character limit
    },
  },
  { 
    timestamps: true // This automatically adds createdAt and updatedAt
  }
);

// Index for better query performance
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);