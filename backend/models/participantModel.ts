import { Schema, model, Document, Types } from "mongoose";

export interface IParticipant extends Document {
  userId: Types.ObjectId;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ParticipantModel = model<IParticipant>(
  "Participant",
  participantSchema
);
