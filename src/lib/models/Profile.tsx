import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUser } from "./User";

export interface IProfile extends Document {
  userId: IUser["_id"];
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscores only
    },
    bio: { 
      type: String, 
      maxlength: 200,
      trim: true,
    },
    avatar: { 
      type: String, // Cloudinary URL
      match: /^https?:\/\/.+/ // Basic URL validation
    },
  },
  { 
    timestamps: true 
  }
);

// Index for better query performance
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ username: 1 });

// Pre-save middleware to ensure consistency
ProfileSchema.pre('save', function(next) {
  if (this.username) {
    this.username = this.username.toLowerCase();
  }
  next();
});

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);