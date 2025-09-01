import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Bollywood from "@/lib/models/bollywood";
import connectdb from "@/lib/Connect";

export async function GET() {
  try {
    // ✅ Always await connection
    await mongoose.connect(connectdb);

    // ✅ Select fields you need (including likedBy for like prevention)
    const result = await Bollywood.find({}, "_id name release likes likedBy description image day");

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching Bollywood data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
