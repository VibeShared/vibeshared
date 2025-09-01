import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Bollywood from "@/lib/models/bollywood";
import connectdb from "@/lib/Connect";

export async function GET(request: Request, { params }: any) {
  try {
     mongoose.connect(connectdb)

     const {id} = await  params

    const result = await Bollywood.findById(id);

    if (!result) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching Bollywood data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}




export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userEmail } = await request.json();

    await mongoose.connect(connectdb);

    const bolly = await Bollywood.findById(id);
    if (!bolly) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ✅ Safety: ensure likedBy exists
    if (!Array.isArray(bolly.likedBy)) {
      bolly.likedBy = [];
    }

    const alreadyLiked = bolly.likedBy.includes(userEmail);

    if (alreadyLiked) {
      // Unlike
      bolly.likes = Math.max(0, bolly.likes - 1);
      bolly.likedBy = bolly.likedBy.filter(email => email !== userEmail);
    } else {
      // Like
      bolly.likes += 1;
      bolly.likedBy.push(userEmail);
    }

    await bolly.save();
    return NextResponse.json(bolly);
    

  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}




