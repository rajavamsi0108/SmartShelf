/**
 * notFound.js
 * Catches any request to a route that doesn't exist and forwards
 * a clean 404 error to errorHandler.js instead of Express's default
 * HTML error page.
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = notFound;
