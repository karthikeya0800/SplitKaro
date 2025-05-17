import { Request, Response } from "express";
import { ExpenseModel, IExpense } from "../models/expenseModel";
import { ParticipantModel } from "../models/participantModel";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  userId?: string;
}

export const getExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const expenses = await ExpenseModel.find({
      userId: new Types.ObjectId(req.userId),
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, description, paidBy, paidFor, date } =
      req.body as Partial<IExpense>;
    if (!amount || !description || !paidBy || !paidFor || !date) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate participants
    const participantIds = paidFor.map((p) => p.participantId);
    const participants = await ParticipantModel.find({
      _id: { $in: participantIds.map((id) => new Types.ObjectId(id)) },
      userId: new Types.ObjectId(req.userId),
    });

    if (participants.length !== participantIds.length) {
      res.status(400).json({ error: "Invalid participants" });
      return;
    }

    const expense = await ExpenseModel.create({
      userId: new Types.ObjectId(req.userId),
      amount,
      description,
      paidBy,
      paidFor,
      date: new Date(date),
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, description, paidBy, paidFor, date } =
      req.body as Partial<IExpense>;

    // Validate participants if provided
    if (paidBy && paidFor) {
      const participantIds = paidFor.map((p) => p.participantId);

      const participants = await ParticipantModel.find({
        _id: { $in: participantIds.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(req.userId),
      });
      if (participants.length !== participantIds.length) {
        res.status(400).json({ error: "Invalid participants" });
        return;
      }
    }

    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(req.userId) },
      {
        amount,
        description,
        paidBy,
        paidFor,
        date: date ? new Date(date) : undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!expense) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }
    res.json(expense);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(req.userId),
    });

    if (!expense) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
