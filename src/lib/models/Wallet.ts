// lib/models/Wallet.ts
import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IWalletTransaction {
  type: "credit" | "debit" | "earning";
  amount: number;
  status?: "pending" | "approved" | "rejected"; // ✅ Add this line
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  type: "earning" | "withdraw";
  amount: number;
  balance: number;
  totalEarned?: number;
  totalWithdrawn?: number;
  status?: "pending" | "approved" | "rejected";
  finalAmount?: number;
  commission?: number;
  transactions: IWalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema<IWallet> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["earning", "withdraw"], required: false },
    amount: { type: Number, required: false },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    finalAmount: { type: Number },
    commission: { type: Number },
    transactions: {
      type: [
        {
          type: { type: String, enum: ["credit", "debit", "earning"], required: true },
          amount: { type: Number, required: true },
          status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // ✅ Added in schema too
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
