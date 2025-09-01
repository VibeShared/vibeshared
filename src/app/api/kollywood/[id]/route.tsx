import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Kollywood from "@/lib/models/kollywood";
import connectdb from "@/lib/Connect";

export async function GET(
 request: Request,
  context: { params: { id: string } }


) {
  try {
        const { id } = context.params;
      
    await  mongoose.connect(connectdb)

    const result = await Kollywood.findById(id);

    if (!result) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching kollywood data:", error);
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

    const movie = await Kollywood.findById(id);
    if (!movie) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const alreadyLiked = movie.likedBy.includes(userEmail);

    if (alreadyLiked) {
      // Unlike
      movie.likes = Math.max(0, movie.likes - 1);
      movie.likedBy = movie.likedBy.filter(email => email !== userEmail);
    } else {
      // Like
      movie.likes += 1;
      movie.likedBy.push(userEmail);
    }

    await movie.save();

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}


