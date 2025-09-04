import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Interface for type checking
interface IBollywood extends Document {
  name: string;
  release: string;
  image: string;
  likes: number;
  likedBy: string[];
  day: string[];
  description: string;
  director: string;
  stars: string;
  writer: string;
  iframe: string;
  
  
}

// 2. Define the schema (with correct collection name to avoid pluralizing)
const bollywoodSchema = new Schema<IBollywood>(
  {
    name: { type: String, },
    release: { type: String, },
    image: { type: String,  },
    likedBy: [{ type: String }],
    likes: { type: Number,},
    day: { type: [String], default:[] },
    description: { type: String, },
    director: { type: String,  },
    stars: { type: String,  },
    writer: { type: String,  },
    iframe: { type: String,  }, // ✅ ensures it's always in API
    
  },
  { collection: "Bollywood" } // prevent Mongoose from using 'bollywoods'
);

// 3. Avoid model overwrite error in Next.js
const Bollywood: Model<IBollywood> =
  mongoose.models.Bollywood || mongoose.model<IBollywood>("Bollywood", bollywoodSchema);

export default Bollywood;
