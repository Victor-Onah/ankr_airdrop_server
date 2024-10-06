import Task from "../models/task.js";

export default class TaskController {
	static async getTasksHandler(req, res) {
		try {
			const { ids, paths } = req.query;

			return res.json(await TaskController.getTasks(ids, paths));
		} catch (error) {
			console.log("Fetch tasks error: ", error);

			res.sendStatus(500);
		}
	}

	static async createTask(taskInfo) {
		try {
			const { title, reward, recurrence, link, priority, platform } =
				taskInfo;

			if (!title || !reward || !link || !platform)
				throw new Error("Missing fields");

			await Task.create({
				title,
				reward,
				link,
				recurrence,
				platform,
				priority
			});

			return true;
		} catch (error) {
			console.log("Task creation error: ", error);

			throw Error;
		}
	}

	static async getTask(id, paths) {
		try {
			return paths
				? await Task.findOne({ id }).select(paths)
				: Task.findOne({ id });
		} catch (error) {
			console.log("Get task error: ", error);

			throw error;
		}
	}

	static async getTasks(tasksIds, paths) {
		try {
			if (tasksIds)
				return paths
					? await Task.find({
							id: {
								$in: tasksIds
							}
					  }).select(paths)
					: await Task.find({
							id: {
								$in: tasksIds
							}
					  });
			else
				return paths
					? await Task.find().select(paths)
					: await Task.find();
		} catch (error) {
			console.log("Get task error: ", error);

			throw error;
		}
	}
}
