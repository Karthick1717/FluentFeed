// Centralized error handler so controllers can just throw / next(err)
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
