"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { CldUploadButton, type CldUploadButtonProps } from "next-cloudinary";
import { toast } from "sonner";
import {  MedicalFileSource, MedicalFileType } from "@/lib/generated/prisma/client";

type Props = CldUploadButtonProps & {
 fileName:string,
    fileType:MedicalFileType,
    fileUrl:string,
    fileSizeBytes:number,
    sourceType:MedicalFileSource,
    patientId:string,
};

function UploadButton({ fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patientId, ...rest }: Props) {
  const router = useRouter();
// added useRef to save our vars when change 
  // دايمًا بيحمل آخر قيم
  const latest = useRef({ fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patientId });
  latest.current = { fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patientId };

  return (
    <CldUploadButton
      uploadPreset="[your preset]"
      signatureEndpoint="/api/sign-cloudinary-params"
      {...rest}
      onSuccess={async (result) => {
        if (typeof result.info === "string" || !result.info) return;

        const { secure_url, public_id, resource_type, format, bytes } = result.info;

        // اقرأ من الـ ref مش من الـ props
        const { fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patientId, } = latest.current;

        // connect it to your endPoint
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: secure_url,
            publicId: public_id,
            resourceType: resource_type,
            format,
            bytes,
           fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patientId,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to upload file");
          console.error(await res.json());
          return;
        }
        toast.success("File uploaded successfully,please refresh page");
        router.refresh();

      }}
    />
  );
}

export default UploadButton;