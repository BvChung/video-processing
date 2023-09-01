import express from "express";
import dotenv from "dotenv";
import pc from "picocolors";
import { setupDirectories } from "./processing-video/service";
import processVideoRoute from "./processing-video/route";
import serverHealthRoute from "./server-health/route";

dotenv.config();
setupDirectories();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({ params: req.params, query: req.query });
});

app.use("/api/v1/process-video", processVideoRoute);
app.use("/api/v1/health", serverHealthRoute);

app.listen(port, () => {
	console.log(
		pc.magenta(pc.underline(`Server running at http://localhost:${port}`))
	);
});
