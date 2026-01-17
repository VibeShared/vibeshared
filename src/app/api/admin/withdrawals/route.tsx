// app/api/admin/withdrawals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Withdrawal from "@/lib/models/Withdrawal";
import { pusherServer } from "@/lib/pusher";
import { Wallet } from "@/lib/models/Wallet";
import Transaction from "@/lib/models/Transaction";

export async function GET() {
  try {
    await connectDB();

    // Fetch all withdrawals + populate user + wallet
    const withdrawals = await Withdrawal.find({})
      .populate("userId", "name email") // ✅ already getting user info
      .lean();

    // ✅ Fetch wallet balance for each user
    const userIds = withdrawals.map((w) => w.userId._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();

    const withdrawalsWithWallet = withdrawals.map((w) => {
      const wallet = wallets.find((wal) => wal.userId.toString() === w.userId._id.toString());
      return {
        ...w,
        walletBalance: wallet ? wallet.balance : 0,
      };
    });

    return NextResponse.json(withdrawalsWithWallet);
  } catch (err) {
    console.error("Admin fetch withdrawals error:", err);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { withdrawalId, action } = await req.json();

    // ✅ Validate request
    if (!withdrawalId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }
    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (action === "approve") {
      // ✅ Calculate commission & final amount
      const commission = withdrawal.amount * 0.2;
      const finalAmount = withdrawal.amount - commission;

      // --- Step 1: Update withdrawal
      try {
        withdrawal.status = "approved";
        withdrawal.commission = commission;
        withdrawal.finalAmount = finalAmount;
        await withdrawal.save();
      } catch (err) {
        console.error("Failed to save withdrawal:", err);
        return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 });
      }

      // --- Step 2: Deduct wallet balance & add transaction
      try {
        wallet.balance = (wallet.balance || 0) - withdrawal.amount;
        wallet.transactions.push({
          type: "debit",
          amount: withdrawal.amount,
          status: "approved",
          createdAt: new Date(),
        });
        await wallet.save();
      } catch (err) {
        console.error("Failed to update wallet:", err);
        return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
      }

      // --- Step 3: Record transaction in Transaction collection
      try {
        await Transaction.create({
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          platformFee: commission,
          creditedAmount: finalAmount,
          type: "withdrawal",
          status: "approved",
        });
      } catch (err) {
        console.error("Failed to create transaction:", err);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
      }

      // --- Step 4: Trigger Pusher event
      try {
        await pusherServer.trigger(`wallet-${withdrawal.userId}`, "withdrawal-update", {
          withdrawalId,
          status: "approved",
          amount: withdrawal.amount,
        });
      } catch (err) {
        console.error("Failed to trigger pusher:", err);
        // ⚠️ Not fatal, just log
      }

    } else if (action === "reject") {
      // --- Reject flow
      try {
        withdrawal.status = "rejected";
        await withdrawal.save();
      } catch (err) {
        console.error("Failed to reject withdrawal:", err);
        return NextResponse.json({ error: "Failed to reject withdrawal" }, { status: 500 });
      }

      try {
        wallet.transactions.push({
          type: "debit",
          amount: withdrawal.amount,
          status: "rejected",
          createdAt: new Date(),
        });
        await wallet.save();
      } catch (err) {
        console.error("Failed to update wallet for rejection:", err);
        return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
      }

      try {
        await Transaction.create({
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          platformFee: 0,
          creditedAmount: 0,
          type: "withdrawal",
          status: "rejected",
        });
      } catch (err) {
        console.error("Failed to create rejection transaction:", err);
        return NextResponse.json({ error: "Failed to record rejection" }, { status: 500 });
      }

      try {
        await pusherServer.trigger(`wallet-${withdrawal.userId}`, "withdrawal-update", {
          withdrawalId,
          status: "rejected",
          amount: withdrawal.amount,
        });
      } catch (err) {
        console.error("Failed to trigger pusher for rejection:", err);
      }
    }

    return NextResponse.json({ success: true, status: withdrawal.status });
  } catch (err) {
    console.error("Admin withdrawal action error:", err);
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}

