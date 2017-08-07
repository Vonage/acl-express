class UnauthorizedError extends Error {
	constructor (message, status) {
		super('Unauthorized' + (message ? ' - ' + message : ''));
		this.status = status || 403;
	}
}

module.exports = UnauthorizedError;
