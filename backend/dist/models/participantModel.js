"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantModel = void 0;
const mongoose_1 = require("mongoose");
const participantSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.ParticipantModel = (0, mongoose_1.model)("Participant", participantSchema);
