import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  image?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
   bio?: string;
  location?: string;
  website?: string;
  cloudinary_id?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  role?: "user" | "admin";
  status?: "active" | "suspended" | "deleted";
  commentPermission?: "everyone" | "followers";
  lastUsernameChange?: Date
  notificationLikes?: boolean;
  notificationComments?: boolean;
  notificationFollows?: boolean;
  termsAccepted: boolean;
  termsAcceptedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
  name: { type: String, maxlength : 50 },
  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true,
},
 image: {
      type: String,
      default:
        "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png", // default avatar
    },

    username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  lastUsernameChange: { type: Date },

  isPrivate: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  commentPermission: {
    type: String,
    enum: ["everyone", "followers"],
    default: "everyone",
  },

termsAccepted: { type: Boolean, required: true },
termsAcceptedAt: { type: Date },


  notificationLikes: {
    type: Boolean,
    default: true,
  },

  notificationComments: {
    type: Boolean,
    default: true,
  },

  notificationFollows: {
    type: Boolean,
    default: true,
  },
  

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  status: {
    type: String,
    enum: ["active", "suspended", "deleted"],
    default: "active",
  },

  password: String,
   cloudinary_id: String,
  bio: { type: String, maxlength: 200 },
  location: { type: String },
  website: { type: String },
  accessToken: String,
  refreshToken: String,
  refreshTokenExpiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
},
 
},
 { timestamps: true }
);


UserSchema.index({ isPrivate: 1 });
UserSchema.index({ status: 1 });



export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
