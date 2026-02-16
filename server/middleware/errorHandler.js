const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // mongo invalid id
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Not found';
  }

  // duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already taken`;
  }

  // validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // jwt
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }

  res.status(statusCode).json({
    success: false,
    error: message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
