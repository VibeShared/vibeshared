import mongoose, { Schema, model, models } from "mongoose";

export interface IFollower {
  follower: mongoose.Types.ObjectId;   // requester
  following: mongoose.Types.ObjectId;  // target
  status: "pending" | "approved";
}

const FollowerSchema = new Schema<IFollower>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "approved",
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follow/request
FollowerSchema.index(
  { follower: 1, following: 1 },
  { unique: true }
);

// Fast checks for privacy
FollowerSchema.index({ following: 1, status: 1 });
FollowerSchema.index({ follower: 1, status: 1 });

export const Follower =
  models.Follower || model<IFollower>("Follower", FollowerSchema);
