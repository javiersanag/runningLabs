"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File as FileIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadActivity } from "@/app/actions/upload";
import { cn } from "@/lib/utils";

export function Dropzone() {
    const router = useRouter();
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus("idle");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
        }
    };

    const handleUpload = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const result = await uploadActivity(formData);
            if (result.success) {
                setStatus("success");
                setMessage("Activity uploaded successfully! Redirecting...");
                setFile(null);
                // Redirect to activities page after 1 second
                setTimeout(() => {
                    router.push("/activities");
                }, 1000);
            } else {
                setStatus("error");
                setMessage(result.error || "Upload failed");
            }
        });
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden",
                    isDragOver
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5",
                    "glass-panel min-h-[300px]"
                )}
            >
                <input
                    type="file"
                    accept=".fit,.gpx,.tcx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                />

                <div className="z-10 flex flex-col items-center pointer-events-none">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors",
                        isDragOver ? "bg-primary text-black" : "bg-white/5 text-white/50"
                    )}>
                        <UploadCloud size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {file ? file.name : "Drag & Drop Activity File"}
                    </h3>
                    <p className="text-white/50 text-sm max-w-xs">
                        {file ? "Ready to upload" : "or click to browse your computer (.FIT, .GPX)"}
                    </p>
                </div>
            </div>

            {status === "error" && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    {message}
                </div>
            )}

            {status === "success" && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-200 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} />
                    {message}
                </div>
            )}

            {file && status !== "success" && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={isPending}
                        className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending && <Loader2 className="animate-spin" size={20} />}
                        {isPending ? "Processing..." : "Confirm Upload"}
                    </button>
                </div>
            )}
        </div>
    );
}
