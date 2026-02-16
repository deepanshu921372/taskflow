class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) {
    return new AppError(msg || 'Bad request', 400);
  }

  static unauthorized(msg) {
    return new AppError(msg || 'Unauthorized', 401);
  }

  static forbidden(msg) {
    return new AppError(msg || 'Access denied', 403);
  }

  static notFound(msg) {
    return new AppError(msg || 'Not found', 404);
  }

  static conflict(msg) {
    return new AppError(msg || 'Already exists', 409);
  }
}

module.exports = AppError;
