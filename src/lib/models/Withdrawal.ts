import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWithdrawal extends Document {
  userId: Types.ObjectId;
  amount: number;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  finalAmount?: number; // after commission
  commission?: number;
  createdAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, required: true },
  finalAmount: { type: Number }, // optional
  commission: { type: Number },   // optional
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);
