import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../lib/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const db = mongoose.connection.readyState === 1 ? "up" : "down";
    res.json({ status: "ok", db, uptime: process.uptime() });
  })
);
