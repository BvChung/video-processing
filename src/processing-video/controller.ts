import { Request, Response } from "express";
import {
	convertVideo,
	deleteProcessedVideo,
	deleteRawVideo,
	downloadRawVideo,
	uploadProcessedVideo,
} from "./processingUtils";

export async function processVideo(req: Request, res: Response) {
	// Get the bucket and filename from the Cloud Pub/Sub message
	let data;
	try {
		const message = Buffer.from(req.body.message.data, "base64").toString(
			"utf8"
		);
		data = JSON.parse(message);
		if (!data.name) {
			throw new Error("Invalid message payload received.");
		}
	} catch (error) {
		console.error(error);
		return res.status(400).send("Bad Request: missing filename.");
	}

	const inputFileName = data.name;
	const outputFileName = `processed-${inputFileName}`;

	// Download the raw video from Cloud Storage
	await downloadRawVideo(inputFileName);

	try {
		// Process the video into 360p
		await convertVideo(inputFileName, outputFileName);

		// Upload the processed video to Cloud Storage
		await uploadProcessedVideo(outputFileName);
	} catch (err) {
		await Promise.all([
			deleteRawVideo(inputFileName),
			deleteProcessedVideo(outputFileName),
		]);

		return res.status(500).send("Server Error: Video processing failed.");
	}

	await Promise.all([
		deleteRawVideo(inputFileName),
		deleteProcessedVideo(outputFileName),
	]);

	return res.status(200).send("Processing finished successfully");
}

export const ping = (req: Request, res: Response) => {
	res
		.status(200)
		.json({ params: req.params, query: req.query, message: "Pong" });
};
