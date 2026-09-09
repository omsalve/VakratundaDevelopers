import { v2 as cloudinary } from "cloudinary";
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import type { FileData, TypeWithID } from "payload";

type CloudinaryUploadMetadata = Partial<FileData & TypeWithID>;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Cloudinary public IDs don't carry the original file extension, so the
// resource's `format` (returned on upload) drives the actual served file type.
const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, "");

const buildPublicId = (prefix: string, filename: string) =>
  `${prefix ? `${prefix}/` : ""}${stripExtension(filename)}`;

export const cloudinaryAdapter = (): Adapter => {
  return ({ prefix = "" }) => {
    return {
      name: "cloudinary",
      fields: [
        {
          name: "cloudinaryPublicId",
          type: "text",
          admin: { hidden: true },
        },
        {
          name: "cloudinaryResourceType",
          type: "text",
          admin: { hidden: true },
        },
      ],
      generateURL: ({ data, filename }) => {
        const publicId = data?.cloudinaryPublicId || buildPublicId(prefix, filename);
        const resourceType = data?.cloudinaryResourceType || "image";
        return cloudinary.url(publicId, {
          resource_type: resourceType,
          secure: true,
          fetch_format: "auto",
          quality: "auto",
        });
      },
      handleUpload: async ({ file }) => {
        const publicId = buildPublicId(prefix, file.filename);
        const result = await new Promise<{ public_id: string; resource_type: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { public_id: publicId, resource_type: "auto", overwrite: true },
              (error, result) => {
                if (error || !result) {
                  reject(error ?? new Error("Cloudinary upload returned no result"));
                  return;
                }
                resolve(result);
              },
            );
            uploadStream.end(file.buffer);
          },
        );

        return {
          cloudinaryPublicId: result.public_id,
          cloudinaryResourceType: result.resource_type,
        } as CloudinaryUploadMetadata;
      },
      handleDelete: async ({ doc, filename }) => {
        const publicId =
          (doc as { cloudinaryPublicId?: string }).cloudinaryPublicId ||
          buildPublicId(prefix, filename);
        const resourceType =
          (doc as { cloudinaryResourceType?: string }).cloudinaryResourceType || "image";
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      },
      staticHandler: async (_req, { params: { filename } }) => {
        const publicId = buildPublicId(prefix, filename);
        const url = cloudinary.url(publicId, { secure: true });
        return Response.redirect(url, 302);
      },
    };
  };
};
