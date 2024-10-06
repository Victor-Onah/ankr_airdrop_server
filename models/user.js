import mongoose from "mongoose";
import generateRandomId from "../utils/generate-random-id.js";

const userSchema = new mongoose.Schema({
	id: {
		type: String,
		unique: true
	},
	username: String,
	firstName: String,
	lastName: String,
	balance: {
		type: Number,
		default: 0
	},
	totalReferrals: {
		type: Number,
		default: 0
	},
	referralCode: {
		type: String,
		default: generateRandomId
	},
	totalTasksCompleted: {
		type: Number,
		default: 0
	},
	dateJoined: {
		type: Date,
		default: Date.now
	},
	lastSignedIn: Date,
	referredBy: String
});

const User = mongoose.connection
	.useDb("Ankr_Airdrop")
	.model("user", userSchema);

export default User;
