import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db/connect";
import {Wallet} from "@/lib/models/Wallet";
import {Notification} from "@/lib/models/Notification";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, fromUserId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1️⃣ Find wallet & update balance
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0, type: "earning" });
    }
    wallet.balance += amount;
    await wallet.save();

    // 2️⃣ Create notification (for real-time alert)
    await Notification.create({
      user: userId, // receiver
      sender: fromUserId, // who sent tip
      type: "tip",
      read: false,
      message: `You received ₹${amount} tip!`,
    });

    return NextResponse.json({ message: "Wallet updated & creator notified", balance: wallet.balance }, { status: 200 });
  } catch (err) {
    console.error("Wallet Add Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
