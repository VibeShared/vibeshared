import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Wallet } from "@/lib/models/Wallet";

// ✅ Explicitly type the context using Next.js conventions
interface RouteContext {
  params: {
    userId: string;
  };
}

export async function GET(req: NextRequest, context: any) {
  try {
    await connectDB();

    const { userId } = context.params; // ✅ safe destructure inside function

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .lean()
      .exec();

    if (!wallet) {
      return NextResponse.json(
        { balance: 0, transactions: [] },
        { status: 200 }
      );
    }

    const sortedTransactions = (wallet.transactions || []).sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      balance: wallet.balance,
      transactions: sortedTransactions,
    });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
