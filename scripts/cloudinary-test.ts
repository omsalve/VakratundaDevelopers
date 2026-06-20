import { loadEnvConfig } from "@next/env";
import { v2 as cloudinary } from "cloudinary";

loadEnvConfig(process.cwd());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const upload = await cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  );
  console.log("Uploaded image secure URL:", upload.secure_url);
  console.log("Uploaded image public ID:", upload.public_id);

  const details = await cloudinary.api.resource(upload.public_id);
  console.log("Width:", details.width);
  console.log("Height:", details.height);
  console.log("Format:", details.format);
  console.log("Size (bytes):", details.bytes);

  // f_auto: lets Cloudinary pick the best image format for the requesting browser
  // q_auto: lets Cloudinary pick the best quality/compression for that format
  const transformedUrl = cloudinary.url(upload.public_id, {
    fetch_format: "auto",
    quality: "auto",
  });

  console.log("Done! Click link below to see optimized version of the image. Check the size and the format.");
  console.log(transformedUrl);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
