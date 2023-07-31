import express, { Request, Response } from "express";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import chalk from "chalk";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({ params: req.params, query: req.query });
});

app.post("/process_video", (req: Request, res: Response) => {
	const { inputFilePath, outputFilePath } = req.body;

	if (!inputFilePath) {
		return res.status(400).send("Bad Request: Missing input file path.");
	}

	if (!outputFilePath) {
		return res.status(400).send("Bad Request: Missing output file path.");
	}

	ffmpeg(inputFilePath)
		.outputOption("-vf", "scale=-1:360")
		.on("end", () => {
			console.log("Processing finished successfully");
			res.status(200).send("Processing finished successfully");
		})
		.on("error", (err) => {
			console.log("An error occurred: " + err.message);
			res.status(500).send("An error occurred: " + err.message);
		})
		.save(outputFilePath);
});

app.listen(port, () => {
	console.log(
		chalk.underline.magenta(`Server running at http://localhost:${port}`)
	);
});
