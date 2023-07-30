import express from "express";
import chalk from "chalk";

const app = express();
const port = 3000;
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(
		chalk.underline.magenta(`Server running at http://localhost:${port}`)
	);
});
