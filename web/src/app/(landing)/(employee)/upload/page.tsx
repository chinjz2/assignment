import { UploadDropZone } from "~/src/components/uploadDropZone";

export const metadata = {
  title: "Upload",
  description: "Upload user information",
};

export default function UploadPage() {
  return (
    <main className="flex justify-center items-center bg-slate-50 min-h-screen">
      <UploadDropZone />
    </main>
  );
}
