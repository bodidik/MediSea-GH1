// FILE: server/middlewares/errorHandler.js
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    ok: false,
    error: err.message || "Internal Server Error",
  };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
