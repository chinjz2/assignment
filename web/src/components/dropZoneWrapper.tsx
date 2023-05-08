"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import UploadCloud from "~/public/images/cloud-upload.png";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { cn } from "~/src/utils/cn";
import { type VariantProps, cva } from "class-variance-authority";
import Button from "@mui/material/Button";

const dropZoneVariants = cva(
  "flex justify-center items-center outline-none transition-colors ease-in-out duration-150 border-8 border-dashed rounded-sm hover:border-blue-700 h-full w-full text-slate-900",
  {
    variants: {
      variant: {
        default: "border-slate-900",
        reject: "border-red-700 hover:border-red-700 !important",
        accept: "border-green-700 hover:border-green-700 !important",
        disabled:
          "border-gray-300 hover:border-gray-300 text-gray-300 !important",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
type DropZoneVariantsProps = VariantProps<typeof dropZoneVariants>;
type DropZoneWrapperProps = DropzoneOptions & {
  styles?: string;
};

const getStyles = (
  disabled: boolean,
  isDragAccept: boolean,
  isDragReject: boolean
) => {
  let props: DropZoneVariantsProps = { variant: "default" };
  if (disabled) props.variant = "disabled";
  else if (isDragReject) props.variant = "reject";
  else if (isDragAccept) props.variant = "accept";
  return dropZoneVariants(props);
};

export function DropZoneWrapper({
  accept,
  noClick,
  onDrop,
  maxFiles = 1,
  styles = "",
  disabled = false,
}: DropZoneWrapperProps) {
  const { getRootProps, getInputProps, isDragAccept, isDragReject, open } =
    useDropzone({
      maxFiles,
      accept,
      onDrop,
      noClick,
      disabled,
    });
  const style = useMemo(
    () => getStyles(disabled, isDragAccept, isDragReject),
    [disabled, isDragAccept, isDragReject]
  );
  return (
    <div className={cn(style, styles)} {...getRootProps({})}>
      <div className="absolute w-[10rem] sm:w-[12rem] md:w-[17rem] lg:w-[25rem]">
        <Image
          style={{ opacity: disabled ? 0.5 : 1 }}
          alt="uploadBG"
          src={UploadCloud}
        />
        <p className="flex justify-center text-xs sm:text-sm md:text-xl lg:text-2xl">
          Drag and drop your files here
        </p>
        <div className="pt-5 flex items-center justify-center">
          <Button
            size="medium"
            variant="outlined"
            onClick={open}
            disabled={disabled}
          >
            Browse
          </Button>
        </div>
      </div>
      <input {...getInputProps()} multiple={maxFiles !== 1} />
    </div>
  );
}
