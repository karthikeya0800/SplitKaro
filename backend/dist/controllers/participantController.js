"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParticipant = exports.updateParticipant = exports.createMultipleParticipants = exports.createParticipant = exports.getParticipants = void 0;
const participantModel_1 = require("../models/participantModel");
const mongoose_1 = require("mongoose");
const getParticipants = async (req, res) => {
    try {
        const participants = await participantModel_1.ParticipantModel.find({
            userId: new mongoose_1.Types.ObjectId(req.userId),
        });
        res.json(participants);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getParticipants = getParticipants;
const createParticipant = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        const existingParticipant = await participantModel_1.ParticipantModel.findOne({
            userId: new mongoose_1.Types.ObjectId(req.userId),
            name: name,
        });
        if (existingParticipant) {
            res.status(400).json({ error: "Participant already exists" });
            return;
        }
        const participant = await participantModel_1.ParticipantModel.create({
            userId: new mongoose_1.Types.ObjectId(req.userId),
            name,
            email,
        });
        res.status(201).json(participant);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.createParticipant = createParticipant;
const createMultipleParticipants = async (req, res) => {
    try {
        const participants = req.body;
        if (!participants || participants.length === 0) {
            res.status(400).json({ error: "Participants are required" });
            return;
        }
        const createdParticipants = await participantModel_1.ParticipantModel.create(participants.map((p) => ({
            userId: new mongoose_1.Types.ObjectId(req.userId),
            name: p.name,
            email: p.email,
        })));
        res.status(201).json(createdParticipants);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.createMultipleParticipants = createMultipleParticipants;
const updateParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        const participant = await participantModel_1.ParticipantModel.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), userId: new mongoose_1.Types.ObjectId(req.userId) }, { name, email, updatedAt: new Date() }, { new: true });
        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }
        res.json(participant);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateParticipant = updateParticipant;
const deleteParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const participant = await participantModel_1.ParticipantModel.findOneAndDelete({
            _id: new mongoose_1.Types.ObjectId(id),
            userId: new mongoose_1.Types.ObjectId(req.userId),
        });
        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }
        res.json({ message: "Participant deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteParticipant = deleteParticipant;
