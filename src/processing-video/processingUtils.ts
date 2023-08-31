import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import dotenv from "dotenv";

const cloudStorage = new Storage();
dotenv.config();

const rawVideoBucketName = process.env.RAW_VIDEO_BUCKET as string;
const processedVideoBucketName = process.env.PROCESSED_VIDEO_BUCKET as string;

const localRawVideoPath = process.env.LOCAL_RAW_VIDEO_PATH as string;
const localProcessedVideoPath = process.env
	.LOCAL_PROCESSED_VIDEO_PATH as string;

export function setupDirectories() {
	ensureDirectoryExistence(localRawVideoPath);
	ensureDirectoryExistence(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
	return new Promise((resolve, reject) => {
		ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
			.outputOption("-vf", "scale=-1:360")
			.on("end", () => {
				console.log("Processing finished successfully");
				resolve("Successfully processed video.");
			})
			.on("error", (err) => {
				console.log("An error occurred: " + err.message);
				reject(err);
			})
			.save(`${localProcessedVideoPath}/${processedVideoName}`);
	});
}

export async function downloadRawVideo(fileName: string) {
	await cloudStorage
		.bucket(rawVideoBucketName)
		.file(fileName)
		.download({ destination: `${localRawVideoPath}/${fileName}` });

	console.log(
		`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
	);
}

export async function uploadProcessedVideo(fileName: string) {
	const bucket = cloudStorage.bucket(processedVideoBucketName);

	await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
		destination: fileName,
	});

	console.log(
		`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
	);

	await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName: string) {
	return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
	return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function deleteFile(filePath: string) {
	return new Promise((resolve, reject) => {
		if (fs.existsSync(filePath)) {
			fs.unlink(filePath, (err) => {
				if (err) {
					console.log(`Failed to delete file at ${filePath}.`, err);
					reject(err);
				} else {
					console.log(`File deleted at ${filePath}`);
					resolve(`File deleted at ${filePath}`);
				}
			});
		} else {
			console.log(`File not found at ${filePath}.`);
			resolve(`File not found at ${filePath}.`);
		}
	});
}

function ensureDirectoryExistence(dirPath: string) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Directory created at ${dirPath}.`);
	}
}
