import Task from "../models/task.js";
import { config } from "dotenv";
import UserTasks from "../models/user-task.js";
import TaskController from "./task-controller.js";
import UserController from "./user-controller.js";

export default class AdminController {
	static async createTaskHandler(req, res) {
		try {
			await TaskController.createTask(req.body);

			res.sendStatus(201);
		} catch (error) {
			console.log("Task creation error: ", error);

			res.status(500).send(error.message);
		}
	}

	static async authenticateAdmin(req, res, next) {
		try {
			const authHeader = req.headers["authorization"];

			if (!authHeader || !/^(Bearer)\s[a-zA-Z0-9]{22}$/.test(authHeader))
				return res.sendStatus(401);

			const authToken = authHeader.split(" ")[1];

			config();

			if (authToken !== process.env.ADMIN_AUTH)
				return res.sendStatus(401);

			next();
		} catch (error) {
			console.log("Admin authentication error: ", error);
		}
	}

	static async deleteTasksHandler(req, res) {
		try {
			const { tasks, all } = req.body;

			if (all) {
				await Task.deleteMany();
			} else {
				await Task.deleteMany({
					id: {
						$in: tasks
					}
				});
			}

			res.sendStatus(204);
		} catch (error) {
			console.log("Task deletion error: ", error);

			res.sendStatus(500);
		}
	}

	static async deleteUserTasksHandler(req, res) {
		try {
			const { tasks, all, userIds } = req.body;

			if (!userIds && !tasks && all) {
				await UserTasks.deleteMany();
			} else if (all && userIds) {
				await UserTasks.deleteMany({
					userId: {
						$in: userIds
					}
				});
			} else if (tasks && userIds) {
				await UserTasks.deleteMany({
					id: {
						$in: tasks
					},
					userId: {
						$in: userIds
					}
				});
			} else {
				await UserTasks.deleteMany({
					id: {
						$in: tasks
					}
				});
			}

			res.sendStatus(204);
		} catch (error) {
			console.log("Task deletion error: ", error);

			res.sendStatus(500);
		}
	}

	static async getUsersHandler(req, res) {
		try {
			const users = await UserController.getUsers();

			res.json(users);
		} catch (error) {
			console.log("Fetch users error: ", error);

			res.sendStatus(500);
		}
	}
}
