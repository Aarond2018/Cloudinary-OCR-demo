import Cors from "cors";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: "ddmm5ofs1",
	api_key: process.env.CLD_API_KEY,
	api_secret: process.env.CLD_API_SECRET,
	secure: true,
});

const cors = Cors({
	methods: ["GET", "HEAD", "POST"],
});

function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
}

export default async function handler(req, res) {
	await runMiddleware(req, res, cors);

	const { baseImage } = req.body;

	try {
		await cloudinary.uploader.upload(
			baseImage, {folder: "ocr-demo"} , async function (error, result) {
				const response = await cloudinary.image(`${result.public_id}.jpg`, {
					effect: "blur_region:800",
					gravity: "ocr_text",
					sign_url: true
				});
				res.status(200).json(response);
			}
		);
	} catch (error) {
		res.status(500).json(error);
	}
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "5mb",
		},
	},
};
