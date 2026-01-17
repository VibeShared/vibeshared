import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBlockedUser extends Document {
  blocker: Types.ObjectId; // who blocked
  blocked: Types.ObjectId; // who is blocked
  createdAt: Date;
}

const BlockedUserSchema = new Schema<IBlockedUser>(
  {
    blocker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocked: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate blocks
BlockedUserSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export default mongoose.models.BlockedUser ||
  mongoose.model<IBlockedUser>("BlockedUser", BlockedUserSchema);
