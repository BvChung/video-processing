import { Router } from "express";
import { processVideo } from "./controller";

const router = Router();

router.route("/").post(processVideo);

export default router;
