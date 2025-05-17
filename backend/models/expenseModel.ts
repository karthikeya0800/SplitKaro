import { Schema, model, Document, Types } from "mongoose";

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number;
  description: string;
  paidBy: { participantId: Types.ObjectId; name: string };
  paidFor: { participantId: Types.ObjectId; name: string; amount?: number }[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    paidBy: {
      participantId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Participant",
      },
      name: { type: String, required: true },
    },
    paidFor: [
      {
        participantId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Participant",
        },
        name: { type: String, required: true },
        amount: { type: Number },
      },
    ],
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ExpenseModel = model<IExpense>("Expense", expenseSchema);
