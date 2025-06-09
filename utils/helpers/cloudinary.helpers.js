import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (image) => {
    const uploaded = await cloudinary.uploader.upload(image);
    return uploaded.secure_url;
};

export const deleteImage = async (url) => {
    const publicId = url.split("/").pop().split(".")[0];
    return await cloudinary.uploader.destroy(publicId);
};
