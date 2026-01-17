import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Wallet } from "@/lib/models/Wallet";
import Withdrawal from "@/lib/models/Withdrawal";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, amount, upiId } = await req.json();

    if (!userId || !amount || amount <= 0 || !upiId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Only create withdrawal request, do NOT deduct balance yet
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      upiId,
      status: "pending",
    });

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) {
    console.error("Withdrawal request error:", err);
    return NextResponse.json({ error: "Failed to request withdrawal" }, { status: 500 });
  }
}
