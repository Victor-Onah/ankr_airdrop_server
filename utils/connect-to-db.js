import mongoose from "mongoose";
import { config } from "dotenv";

const connectToDb = async () => {
	try {
		config();

		await mongoose.connect(process.env.DB_URL);
	} catch (error) {
		console.log("Database connection error: ", error);
	}
};

export default connectToDb;
