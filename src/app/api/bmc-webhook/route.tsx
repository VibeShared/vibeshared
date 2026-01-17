import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Wallet } from "@/lib/models/Wallet";
import { Notification } from "@/lib/models/Notification";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { creatorId, amount, fromUserId } = await req.json();

    if (!creatorId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json({ error: "Invalid creator ID" }, { status: 400 });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(creatorId) });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: new mongoose.Types.ObjectId(creatorId),
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        transactions: [],
      });
    }

    // Calculate platform fee
    const platformFee = amount * 0.3;
    const creatorAmount = amount - platformFee;

    // Push transaction (enum-safe)
    wallet.transactions.push({
      type: "credit",       // ✅ must be "credit" | "debit" | "earning"
      amount: creatorAmount,
      status: "approved",   // ✅ must be "pending" | "approved" | "rejected"
      createdAt: new Date(),
    });

    // Update wallet balance & totalEarned
    wallet.balance += creatorAmount;
    wallet.totalEarned = (wallet.totalEarned || 0) + creatorAmount;

    await wallet.save();

    // Create notification
    if (fromUserId) {
      await Notification.create({
        user: creatorId,
        sender: fromUserId,
        type: "tip",
        read: false,
        message: `You received ₹${creatorAmount} tip (after 30% fee)`,
      });
    }

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      platformFee, 
      creatorAmount,
    });
  } catch (err: any) {
    console.error("BMC Webhook Error:", err.message || err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
