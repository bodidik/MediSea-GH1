// FILE: server/routes/admin.import.routes.js (ESM)
import express from "express";
import * as ctrl from "../controllers/admin.import.controller.js";


const router = express.Router();


// JSON body bekler (CSV ise gövde içinde string alanı kullanın)
// Not: server.js'te global express.json var; burada tekrar etmek optional.
router.post("/videos", ctrl.importVideos);
router.post("/notes", ctrl.importNotes);


export default router;