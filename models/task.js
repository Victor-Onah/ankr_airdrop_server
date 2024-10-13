import mongoose from "mongoose";
import generateRandomId from "../utils/generate-random-id.js";

const taskSchema = new mongoose.Schema({
	id: {
		type: String,
		default: () => generateRandomId(24),
	},
	title: {
		type: String,
		required: true,
	},
	reward: {
		type: Number,
		required: true,
	},
	platform: {
		type: String,
		enum: ["Facebook", "YouTube", "Telegram", "WhatsApp", "X"],
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	recurrence: {
		type: String,
		enum: ["daily", "none"],
		default: "none",
	},
	link: {
		type: String,
		required: true,
	},
	priority: {
		type: Number,
		default: 0.5,
	},
});

const Task = mongoose.connection
	.useDb("Ankr_Airdrop")
	.model("task", taskSchema);

export default Task;
