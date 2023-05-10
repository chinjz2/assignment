"use client";
import React, { useEffect, useState, useCallback } from "react";
import { DropZoneWrapper } from "./dropZoneWrapper";
import Button from "@mui/material/Button";
import { SuccessToast, ErrorToast } from "./toast";
import { ToastContainer } from "react-toastify";
import uuid from "react-uuid";

const chunkSize: number = 10 * 1024;

export function UploadDropZone() {
  const [file, setFile] = useState<Blob[]>([]);
  const [uniqID, setUniqId] = useState<string>("");
  const [progress, setProgress] = useState<string>("0");
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);

  const resetFields = () => {
    setUniqId("");
    setProgress("0");
    setCurrentChunkIndex(-1);
  };
  const onSubmit = () => {
    if (file.length > 0) {
      setCurrentChunkIndex(0);
      setUniqId(uuid());
    }
  };
  const verifyUpload = async (fileName: string) => {
    try {
      const resp = await fetch("http://localhost:3001/users/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: fileName,
          time: Date.now(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (resp.ok) {
        setProgress("Success");
        SuccessToast("Upload succeeded");
      } else {
        setProgress("Failed");
        ErrorToast("File contains invalid entries");
      }
    } catch (err) {
      setProgress("Failed");
      ErrorToast("File contains invalid entries");
    }
  };
  const uploadChunk = useCallback(
    async (e: ProgressEvent<FileReader>) => {
      const curFile = file[0];
      const data = e.target?.result;
      const params = new URLSearchParams();
      params.set("name", curFile.name);
      params.set("size", curFile.size.toString());
      params.set("currentChunkIndex", currentChunkIndex.toString());
      params.set("totalChunks", Math.ceil(curFile.size / chunkSize).toString());
      params.set("id", uniqID);

      try {
        const resp = await fetch(
          "http://localhost:3001/users/uploadUserFile?" + params.toString(),
          {
            method: "POST",
            body: data,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!resp.ok) {
          resetFields();
          if (resp.status === 403)
            ErrorToast("Another upload is currently happening");
          else ErrorToast("Upload failed");
          return;
        }

        const fileData = await resp.json();
        const curFile = file[0];
        const filesize = curFile.size;
        const chunks = Math.ceil(filesize / chunkSize) - 1;
        const isLastChunk = currentChunkIndex === chunks;

        if (isLastChunk) {
          setCurrentChunkIndex(-1);
          setProgress("Awaiting verification");
          verifyUpload(fileData?.name);
        } else {
          setCurrentChunkIndex((v) => v + 1);
          setProgress(
            Math.max(
              Math.round(
                (currentChunkIndex / Math.ceil(file[0].size / chunkSize)) * 100
              ),
              0
            ).toString()
          );
        }
      } catch (err) {
        resetFields();
        ErrorToast("Upload failed");
      }
    },
    [currentChunkIndex, file, uniqID]
  );

  const splitFileIntoChunks = useCallback(() => {
    const reader = new FileReader();
    const curFile = file[0];

    if (!curFile) return;

    const from = (currentChunkIndex || 0) * chunkSize;
    const to = from + chunkSize;
    const blob = curFile.slice(from, to);

    reader.onload = (e) => uploadChunk(e);
    reader.readAsDataURL(blob);
  }, [currentChunkIndex, file, uploadChunk]);

  useEffect(() => {
    if (currentChunkIndex >= 0) splitFileIntoChunks();
  }, [currentChunkIndex, splitFileIntoChunks]);
  const onDrop = useCallback((acceptedFile: File[]) => {
    if (acceptedFile.length > 0) {
      setFile(acceptedFile);
      setProgress("0");
    }
  }, []);

  return (
    <section
      className={
        "container flex justify-center items-center flex-col h-[18rem] sm:h-[24rem] md:h-[32rem] lg:h-[48rem]"
      }
    >
      <DropZoneWrapper
        maxFiles={1}
        accept={{
          "text/csv": [".csv"],
        }}
        noClick={true}
        onDrop={onDrop}
        disabled={currentChunkIndex !== -1}
      />
      <div
        className="mt-6 flex justify-center items-center w-full"
        style={{ opacity: file.length > 0 ? 1 : 0 }}
      >
        {file.length > 0 && (
          <div className="mr-6">
            <p>
              {file[0].name} - Progress: {progress}%
            </p>
          </div>
        )}
        <Button
          size="medium"
          variant="outlined"
          onClick={onSubmit}
          disabled={
            file.length === 0 || currentChunkIndex !== -1 || progress !== "0"
          }
        >
          Upload
        </Button>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </section>
  );
}
