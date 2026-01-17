// lib/models/Notification.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId; // receiver
  sender: Types.ObjectId; // actor
  type: "like" | "comment" | "follow";
  postId?: Types.ObjectId;
  message?: string;
  read: boolean;
  deleteAfterSeconds?: number; // custom time for auto-delete
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow", "follow_request", "tip"], required: true },
    message: { type: String },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    read: { type: Boolean, default: false },
    deleteAfterSeconds: { type: Number, default: 60 * 60 * 24 * 10 }, // default 10 days
    
  },
  { timestamps: true }
);

// TTL index using deleteAfterSeconds
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 0 } // We'll handle per-notification TTL via cron below
);

export const Notification = mongoose.models.Notification
  ? mongoose.model<INotification>("Notification")
  : mongoose.model<INotification>("Notification", NotificationSchema);

