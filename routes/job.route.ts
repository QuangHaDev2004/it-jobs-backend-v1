import { Router } from "express";
import * as jobbController from "../controllers/job.controller";

const router = Router();

router.get("/detail/:id", jobbController.detail);

export default router;
