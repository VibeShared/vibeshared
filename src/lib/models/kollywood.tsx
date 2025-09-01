import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Interface for type checking
interface Kollywod extends Document {
 name: string;
  release: string;
  image: string;
  likes: number;
  likedBy: string[];
  day: string[];
  description: string;
}

// 2. Define the schema (with correct collection name to avoid pluralizing)
const kollywoodSchema = new Schema<Kollywod>(
  {
    name: { type: String, },
    release: { type: String, },
    image: { type: String,  },
    likedBy: [{ type: String }],
    likes: { type: Number,},
    day: { type: [String], default:[] },
    description: { type: String, },
  },
  { collection: "Kollywood" } // prevent Mongoose from using 'bollywoods'
);

// 3. Avoid model overwrite error in Next.js
const Kollywood: Model<Kollywod> =
  mongoose.models.Kollywood || mongoose.model<Kollywod>("Kollywood", kollywoodSchema);

export default Kollywood;