import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Kollywood from "@/lib/models/kollywood";
import connectdb from "@/lib/Connect"; // fixed name

export async function GET() {
  try {
    await mongoose.connect(connectdb);

    const result = await Kollywood.find();
    return NextResponse.json({result : result});
  } catch (error) {
    console.error("Error fetching Kollywood data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
