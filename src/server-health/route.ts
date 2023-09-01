import { Router } from "express";
import { getHealth } from "./controller";

const router = Router();

router.route("/").get(getHealth);

export default router;
