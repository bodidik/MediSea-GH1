import * as ctrl from "../controllers/video.controller.js";
import express from "express";
const router = express.Router();

// FILE: server/routes/video.routes.js

router.post("/", ctrl.createVideo);
module.exports = router;export default router;



