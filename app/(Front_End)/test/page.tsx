"use client";
import { CldUploadButton } from "next-cloudinary";

export default function ImageUploader() {
  return (
    <CldUploadButton
      uploadPreset="uploadImage"
      options={{ multiple: true }}
      onUpload={(error, result) => {
        if (result) console.log(result.info.secure_url);
      }}
    >
      Upload Image
    </CldUploadButton>
  );
}   