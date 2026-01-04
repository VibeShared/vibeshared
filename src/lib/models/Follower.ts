import mongoose, { Schema, model, models } from "mongoose";

export interface IFollower {
  follower: mongoose.Types.ObjectId; // who follows
  following: mongoose.Types.ObjectId; // who is being followed
}

const FollowerSchema = new Schema<IFollower>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowerSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follower =
  models.Follower || model<IFollower>("Follower", FollowerSchema);
