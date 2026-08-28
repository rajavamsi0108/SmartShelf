/**
 * errorHandler.js
 *
 * Centralized error handling, equivalent to @RestControllerAdvice /
 * GlobalExceptionHandler.java. Every controller calls next(err) on
 * failure, and this middleware turns it into a clean JSON response.
 */
function errorHandler(err, req, res, next) {
  // Mongoose validation errors (from schema "required"/"min" rules)
  if (err.name === "ValidationError") {
    const errors = {};
    Object.values(err.errors).forEach((fieldError) => {
      errors[fieldError.path] = fieldError.message;
    });
    return res.status(400).json({
      message: "Validation failed",
      status: 400,
      timestamp: new Date().toISOString(),
      errors,
    });
  }

  // Invalid MongoDB ObjectId format (e.g. /api/products/not-a-real-id)
  if (err.name === "CastError") {
    return res.status(404).json({
      message: `Product not found with id: ${err.value}`,
      status: 404,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom errors thrown in controllers (err.statusCode set manually)
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong. Please try again.",
    status: statusCode,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
