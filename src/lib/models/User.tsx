import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
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
}

const UserSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true },
 image: {
      type: String,
      default:
        "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png", // default avatar
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
  index: { expires: 0 }, // TTL index → Mongo deletes when expired
},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
