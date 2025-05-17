import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/userModel";
import { Types } from "mongoose";
import { ExpenseModel } from "../models/expenseModel";
import { ParticipantModel } from "../models/participantModel";

interface LoginInput {
  email: string;
  password: string;
  currency: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, currency } = req.body as Partial<IUser>;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      currency,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id, currency: user.currency });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        currency: req.body.currency,
        updatedAt: new Date(),
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await UserModel.deleteOne({ _id: new Types.ObjectId(id) });
    await ExpenseModel.deleteMany({ userId: new Types.ObjectId(id) });
    await ParticipantModel.deleteMany({ userId: new Types.ObjectId(id) });
    res.json({ message: "It was good while it lasted, Good Bye mate!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
