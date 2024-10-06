import UserController from "./user-controller.js";

export default class TelegramBotController {
	static async handleRequest(req, res) {
		const { message } = req.body;

		if (message) {
			const { chat, from, text } = message;
			const { type } = chat;

			if (type !== "private") return;

			await TelegramBotController.#handleCommand(from, text);
		}

		res.sendStatus(200);
	}

	static async #sendMessage(chatId, text, keyboard) {
		try {
			const telegramChatEndpoint = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

			const requestBody = {
				text,
				chat_id: chatId,
				parse_mode: "Markdown",
				reply_markup: keyboard
					? {
							inline_keyboard: [keyboard]
					  }
					: undefined
			};

			const requestOptions = {
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					"Content-Type": "application/json"
				}
			};

			await fetch(telegramChatEndpoint, requestOptions);
		} catch (error) {
			console.log("Telegram webhook error: ", error);
		}
	}

	static async #handleCommand(chat, command) {
		if (command.startsWith("/start")) {
			const { id, username, last_name, first_name } = chat;
			const userExists = await UserController.userExists({ id });
			const containsReferralCode = /^\/start\s[a-zA-Z0-9]{10}$/.test(
				command
			);

			if (!userExists) {
				await UserController.createAccount({
					id,
					username,
					lastName: last_name,
					firstName: first_name,
					referredBy: containsReferralCode
						? command.split(" ")[0]
						: undefined
				});

				containsReferralCode &&
					(await UserController.updateUser(
						{
							referralCode: command.split(" ")[0]
						},
						{
							totalReferrals: { type: "increment" },
							balance: {
								type: "increment",
								step: 10
							}
						}
					));
			}

			await TelegramBotController.#sendMessage(
				id,
				`**👋 Welcome to the Ankr Airdrop Bot!** \nWe're excited to have you on board! 🎉 \n\nHere's what you can do with this bot: \n- **💰 Earn ANKR tokens** by completing daily tasks and referring friends! \n- **🔗 Get your unique referral link** and invite others to join the airdrop for extra rewards. \n- **📅 Check-in daily** to maintain your task streak and maximize your earnings. \n\nTo get started: \n1. **Click the button below** to sign in. \n2. **Complete daily tasks** to boost your rewards. \n3. **Invite your friends** and earn more ANKR tokens! \n\nReady to start? Let's go! 🚀`,
				[
					{
						text: "Sign In",
						url: "https://ankr-airdrop.netlify.app"
					}
				]
			);

			return;
		}

		await TelegramBotController.#sendMessage(
			id,
			`**👋 Welcome to the Ankr Airdrop Bot!** \nIt's great to have you on board! 🎉\n\nLet's get you signed in!`,
			[
				{
					text: "Sign In",
					url: "https://ankr-airdrop.netlify.app"
				}
			]
		);
	}
}
