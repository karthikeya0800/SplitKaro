import { Request, Response } from "express";
import { ParticipantModel, IParticipant } from "../models/participantModel";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  userId?: string;
}

export const getParticipants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const participants = await ParticipantModel.find({
      userId: new Types.ObjectId(req.userId),
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body as Partial<IParticipant>;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const existingParticipant = await ParticipantModel.findOne({
      userId: new Types.ObjectId(req.userId),
      name: name,
    });
    if (existingParticipant) {
      res.status(400).json({ error: "Participant already exists" });
      return;
    }

    const participant = await ParticipantModel.create({
      userId: new Types.ObjectId(req.userId),
      name,
      email,
    });
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createMultipleParticipants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const participants = req.body as Partial<IParticipant>[];
    if (!participants || participants.length === 0) {
      res.status(400).json({ error: "Participants are required" });
      return;
    }

    const createdParticipants = await ParticipantModel.create(
      participants.map((p) => ({
        userId: new Types.ObjectId(req.userId),
        name: p.name,
        email: p.email,
      }))
    );
    res.status(201).json(createdParticipants);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body as Partial<IParticipant>;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const participant = await ParticipantModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(req.userId) },
      { name, email, updatedAt: new Date() },
      { new: true }
    );

    if (!participant) {
      res.status(404).json({ error: "Participant not found" });
      return;
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(req.userId),
    });

    if (!participant) {
      res.status(404).json({ error: "Participant not found" });
      return;
    }
    res.json({ message: "Participant deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
