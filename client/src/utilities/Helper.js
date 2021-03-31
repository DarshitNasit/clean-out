export { timeout };

async function timeout(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
