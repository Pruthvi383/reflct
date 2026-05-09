function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const statusCode = error.statusCode || (error.name === "SequelizeUniqueConstraintError" ? 409 : 500);
  const message = error.name === "SequelizeUniqueConstraintError"
    ? "A record with this email already exists"
    : error.message || "Internal server error";
  res.status(statusCode).json({ message, statusCode });
}

module.exports = { errorHandler };
