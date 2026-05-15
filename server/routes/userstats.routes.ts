import { Router } from "express";
import { getUserStats } from "../controllers/userstats.controller";

const router = Router();
router.get("/:userId", getUserStats);
export default router;
