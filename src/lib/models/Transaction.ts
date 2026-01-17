// lib/models/Transaction.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  amount: number;
  platformFee: number;
  creditedAmount: number;
  type: "tip" | "withdrawal";
  status:  "pending" | "approved" | "rejected";
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  creditedAmount: { type: Number, required: true },
  type: { type: String, enum: ["tip", "withdrawal"], default: "tip" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
