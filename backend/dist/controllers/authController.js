"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const mongoose_1 = require("mongoose");
const expenseModel_1 = require("../models/expenseModel");
const participantModel_1 = require("../models/participantModel");
const register = async (req, res) => {
    try {
        const { email, password, currency } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const existingUser = await userModel_1.UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await userModel_1.UserModel.create({
            email,
            password: hashedPassword,
            currency,
        });
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(201).json({ token, userId: user._id });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = await userModel_1.UserModel.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token, userId: user._id, currency: user.currency });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.login = login;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel_1.UserModel.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id) }, {
            currency: req.body.currency,
            updatedAt: new Date(),
        }, { new: true });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userModel_1.UserModel.deleteOne({ _id: new mongoose_1.Types.ObjectId(id) });
        await expenseModel_1.ExpenseModel.deleteMany({ userId: new mongoose_1.Types.ObjectId(id) });
        await participantModel_1.ParticipantModel.deleteMany({ userId: new mongoose_1.Types.ObjectId(id) });
        res.json({ message: "It was good while it lasted, Good Bye mate!" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteUser = deleteUser;
