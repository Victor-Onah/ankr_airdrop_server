import mongoose from "mongoose";

const disconnectFromDb = async () => {
	try {
		const { connections } = mongoose;

		for (const connection of connections) {
			await connection.close();
		}
	} catch (error) {
		console.log("Database disconnection error: ", error);
	}
};

export default disconnectFromDb;
