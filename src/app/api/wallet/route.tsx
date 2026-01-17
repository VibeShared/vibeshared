// app/api/wallet/withdraw/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Wallet } from "@/lib/models/Wallet";
import Withdrawal from "@/lib/models/Withdrawal";
import { pusherServer } from "@/lib/pusher";
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

    // ✅ Create withdrawal request (do not touch wallet balance)
    const withdrawal = await Withdrawal.create({
      userId: wallet.userId,
      amount,
      upiId,
      status: "pending",
    });

    await pusherServer.trigger(`wallet-${userId}`, "withdrawal-update", {
      withdrawalId: withdrawal._id,
      status: "pending",
      amount,
    });

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) {
    console.error("Withdrawal error:", err);
    return NextResponse.json({ error: "Failed to request withdrawal" }, { status: 500 });
  }
}
