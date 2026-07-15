"use client";
import { CldUploadButton } from "next-cloudinary";

export default function ImageUploader() {
  return (
    <CldUploadButton
      uploadPreset="your_unsigned_preset_name"
      options={{ multiple: true }}
      onUpload={(error, result) => {
        if (result) console.log(result.info.secure_url);
      }}
    >
      Upload Image
    </CldUploadButton>
  );
}   