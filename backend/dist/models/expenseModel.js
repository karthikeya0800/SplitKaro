"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseModel = void 0;
const mongoose_1 = require("mongoose");
const expenseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    paidBy: {
        participantId: {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "Participant",
        },
        name: { type: String, required: true },
    },
    paidFor: [
        {
            participantId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.ExpenseModel = (0, mongoose_1.model)("Expense", expenseSchema);
