"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const expenseModel_1 = require("../models/expenseModel");
const participantModel_1 = require("../models/participantModel");
const mongoose_1 = require("mongoose");
const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseModel_1.ExpenseModel.find({
            userId: new mongoose_1.Types.ObjectId(req.userId),
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        const { amount, description, paidBy, paidFor, date } = req.body;
        if (!amount || !description || !paidBy || !paidFor || !date) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Validate participants
        const participantIds = paidFor.map((p) => p.participantId);
        const participants = await participantModel_1.ParticipantModel.find({
            _id: { $in: participantIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
            userId: new mongoose_1.Types.ObjectId(req.userId),
        });
        if (participants.length !== participantIds.length) {
            res.status(400).json({ error: "Invalid participants" });
            return;
        }
        const expense = await expenseModel_1.ExpenseModel.create({
            userId: new mongoose_1.Types.ObjectId(req.userId),
            amount,
            description,
            paidBy,
            paidFor,
            date: new Date(date),
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, paidBy, paidFor, date } = req.body;
        // Validate participants if provided
        if (paidBy && paidFor) {
            const participantIds = paidFor.map((p) => p.participantId);
            const participants = await participantModel_1.ParticipantModel.find({
                _id: { $in: participantIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
                userId: new mongoose_1.Types.ObjectId(req.userId),
            });
            if (participants.length !== participantIds.length) {
                res.status(400).json({ error: "Invalid participants" });
                return;
            }
        }
        const expense = await expenseModel_1.ExpenseModel.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), userId: new mongoose_1.Types.ObjectId(req.userId) }, {
            amount,
            description,
            paidBy,
            paidFor,
            date: date ? new Date(date) : undefined,
            updatedAt: new Date(),
        }, { new: true });
        if (!expense) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        res.json(expense);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await expenseModel_1.ExpenseModel.findOneAndDelete({
            _id: new mongoose_1.Types.ObjectId(id),
            userId: new mongoose_1.Types.ObjectId(req.userId),
        });
        if (!expense) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        res.json({ message: "Expense deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteExpense = deleteExpense;
