import UserTasks from "../models/user-task.js";
import User from "../models/user.js";
import TaskController from "./task-controller.js";

export default class UserController {
	static async createAccount(accountDetails) {
		try {
			await User.create(accountDetails);
		} catch (error) {
			console.log("User creation error: ", error);
		}
	}

	static async userExists(props) {
		try {
			return await User.exists(props);
		} catch (error) {
			console.log(error);

			return null;
		}
	}

	static async updateUser(uniqueProps, updates) {
		try {
			const user = await User.findOne(uniqueProps);

			if (user) {
				for (const update in updates) {
					const { type, value, step } = updates[update];

					if (type) {
						if (type === "increment") {
							if (step) {
								user[update] += step;
							} else {
								++user[update];
							}
						} else if (type === "decrement") {
							if (step) {
								user[update] -= step;
							} else {
								--user[update];
							}
						}
					} else {
						user[update] = value;
					}
				}

				await user.save();

				return true;
			}

			return false;
		} catch (error) {
			console.log("User data update error: ", error);

			return false;
		}
	}

	static async authenticateUser(req, res, next) {
		try {
			const authHeader = req.headers["x-enc-id"];

			if (!authHeader) return res.sendStatus(401);

			const decryptedAuthId = atob(authHeader);
			const userExists = await UserController.userExists({
				id: decryptedAuthId,
			});

			if (!userExists) return res.sendStatus(404);

			req.id = decryptedAuthId;

			next();
		} catch (error) {
			console.log("Authentication error: ", error);

			res.sendStatus(500);
		}
	}

	static async getUserHandler(req, res) {
		try {
			const { id } = req;
			const user = await User.findOne({ id });

			user.lastSignedIn = Date.now();

			res.json(user.toObject());

			await user.save();
		} catch (error) {
			console.log("Fetch user error: ", error);
			res.sendStatus(500);
		}
	}

	static async getUserTasksHandler(req, res) {
		const { id } = req;

		try {
			const tasks = await UserTasks.find({ userId: id });

			res.json(tasks);
		} catch (error) {
			console.log("Fetch user task error: ", error);

			res.sendStatus(500);
		}
	}

	static async clearExpiredUserDailyTasks() {
		try {
			const currentDate = new Date();

			currentDate.setHours(0, 0, 0, 0);
			await UserTasks.deleteMany({
				taskRecurrence: "daily",
				completedAt: {
					$lt: currentDate,
				},
			});

			const allUserTasks = await UserTasks.find().select("userId");
			const users = await User.find().select("id");

			for (let { id } of users) {
				await User.findOneAndUpdate(
					{ id },
					{
						totalTasksCompleted: allUserTasks.filter(
							(task) => task.userId === id,
						).length,
					},
				);
			}
		} catch (error) {
			console.log("DB cleanup error: ", error);
		}
	}

	static async initializeTask(req, res) {
		const { task_id, id } = req.query;

		try {
			const isTaskAlreadyDone = await UserTasks.exists({
				taskId: task_id,
				userId: id,
			});

			if (isTaskAlreadyDone) return;

			const task = await TaskController.getTask(
				task_id,
				"reward recurrence title platform",
			);

			await UserTasks.create({
				userId: id,
				taskId: task_id,
				reward: task.reward,
				taskRecurrence: task.recurrence,
				taskTitle: task.title,
				completedAt: Date.now(),
				platform: task.platform,
			});

			await UserController.updateUser(
				{ id },
				{
					balance: {
						type: "increment",
						step: task.reward,
					},
					totalTasksCompleted: {
						type: "increment",
					},
				},
			);

			res.sendStatus(204);
		} catch (error) {
			console.log("Task completion error: ", error);

			res.sendStatus(500);
		}
	}

	static async getRefereesHandler(req, res) {
		try {
			const { id } = req;
			const user = await User.findOne({ id });

			if (!user) res.sendStatus(404);

			const referees = await User.find({
				referredBy: user.referralCode,
			}).select("username dateJoined balance");

			res.json(referees);
		} catch (error) {
			console.log("Fetch user referees error: ", error);

			res.sendStatus(500);
		}
	}

	static async getUsers() {
		try {
			const users = await User.find();

			return users;
		} catch (error) {
			throw error;
		}
	}

	static async confirmTaskHandler(req, res) {
		try {
			const { id } = req;
			const { task_id } = req.query;
			const userTask = await UserTasks.exists({
				taskId: task_id,
				userId: id,
			});

			if (!userTask) return res.sendStatus(404);
			else res.sendStatus(204);
		} catch (error) {
			console.log("User task completion confirmation error: ", error);

			res.sendStatus(500);
		}
	}
}
