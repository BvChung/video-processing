import express from "express";
import dotenv from "dotenv";
import pc from "picocolors";
import pinoHttp from "pino-http";
import { setupDirectories } from "./processing-video/processingUtils";
import processVideoRoute from "./processing-video/route";

dotenv.config();
setupDirectories();

const app = express();
const port = process.env.PORT || 4000;
// const logger = pinoHttp();

app.use(express.json());
// app.use(logger);

app.get("/", (req, res) => {
	res.status(200).json({ params: req.params, query: req.query });
});

app.use("/api/v1/process-video", processVideoRoute);

app.listen(port, () => {
	console.log(
		pc.magenta(pc.underline(`Server running at http://localhost:${port}`))
	);
});
