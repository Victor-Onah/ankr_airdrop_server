import mongoose from "mongoose";

const userTaskSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	taskId: {
		type: String,
		required: true
	},
	completedAt: {
		type: Date,
		required: true
	},
	taskTitle: {
		type: String,
		required: true
	},
	taskRecurrence: {
		type: String,
		enum: ["daily", "none"],
		default: "none"
	},
	reward: {
		type: Number,
		required: true
	},
	platform: {
		type: String,
		required: true
	}
});

const UserTasks = mongoose.connection
	.useDb("Ankr_Airdrop")
	.model("user_task", userTaskSchema);

export default UserTasks;
