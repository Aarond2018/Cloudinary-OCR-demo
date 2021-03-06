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

	const { baseImage, overlay } = req.body;

	try {
		await cloudinary.uploader.upload(baseImage, {folder: "ocr-demo"} , async function (error, baseImageCld) {
				await cloudinary.uploader.upload(overlay, {folder: "ocr-demo"} , async function (error, overlayImageCld) {
						const overlayedImage = await cloudinary.image(`${baseImageCld.public_id}.jpg`, {
								transformation: [
									{ overlay: `${overlayImageCld.public_id}`.replace(/\//g, ":") },
									{ flags: "region_relative", width: "1.1", crop: "scale" },
									{ flags: "layer_apply", gravity: "ocr_text" }
								], sign_url: true }
						);
						res.status(200).json(overlayedImage);
					}
				);
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
