import { Router } from "express";
import { processVideo, ping } from "./controller";

const router = Router();

router.route("/").get(ping).post(processVideo);

export default router;
