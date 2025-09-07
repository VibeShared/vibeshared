import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";

export interface IFollower extends Document {
  follower: IUser["_id"]; // user who follows
  following: IUser["_id"]; // user being followed
  createdAt: Date;
}

const FollowerSchema: Schema<IFollower> = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowerSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follower: Model<IFollower> =
  mongoose.models.Follower || mongoose.model<IFollower>("Follower", FollowerSchema);
