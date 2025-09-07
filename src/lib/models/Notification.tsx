import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";

export interface INotification extends Document {
  user: IUser["_id"]; // Who receives the notification
  sender: IUser["_id"]; // Who triggered the notification
  type: "follow" | "like" | "comment";
  postId?: string; // Optional (for like/comment notifications)
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "like", "comment"], required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
