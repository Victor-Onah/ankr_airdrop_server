const generateRandomId = (length = 10) => {
	let referralCode = "";
	const alphanumeric =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

	for (let i = 0; i < length; i++) {
		referralCode += alphanumeric.charAt(
			Math.random() * alphanumeric.length
		);
	}

	return referralCode;
};

export default generateRandomId;
