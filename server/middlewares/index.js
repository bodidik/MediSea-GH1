// FILE: server/middlewares/index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { attachRole } from "./role.js";

export function applyCoreMiddlewares(app) {
  // CORS
  const defaultOrigins = "http://localhost:3000,http://localhost:3001,http://localhost:3002";
  const allow = (process.env.VIDEO_ALLOWED_ORIGINS || defaultOrigins)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allow,
      credentials: true,
    })
  );

  // JSON
  app.use(express.json({ limit: "1mb" }));

  // Logger
  app.use(morgan("dev"));

  // Role binder (V/M/P/kayseritip)
  app.use(attachRole);
}
