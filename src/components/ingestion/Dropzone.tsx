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
                    "relative border-2 border-dashed rounded-3xl p-16 transition-all duration-500 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden",
                    isDragOver
                        ? "border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-orange-100/50"
                        : "border-neutral-200 bg-white hover:border-primary/40 hover:bg-neutral-50/50",
                    "min-h-[350px] shadow-sm"
                )}
            >
                <input
                    type="file"
                    accept=".fit,.gpx,.tcx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={handleFileSelect}
                />

                <div className="z-10 flex flex-col items-center pointer-events-none">
                    <div className={cn(
                        "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 shadow-sm",
                        isDragOver ? "bg-primary text-white rotate-12 scale-110" : "bg-neutral-100 text-neutral-400"
                    )}>
                        <UploadCloud size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                        {file ? file.name : "Ready to Import Activities"}
                    </h3>
                    <p className="text-neutral-500 text-sm max-w-xs font-medium leading-relaxed">
                        {file ? "File analyzed and ready for processing" : "Drag & drop training files here or click to browse your system"}
                    </p>

                    {!file && (
                        <div className="mt-8 flex gap-3">
                            <span className="px-3 py-1 bg-neutral-100 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full">.FIT</span>
                            <span className="px-3 py-1 bg-neutral-100 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full">.GPX</span>
                        </div>
                    )}
                </div>
            </div>

            {status === "error" && (
                <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    {message}
                </div>
            )}

            {status === "success" && (
                <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    {message}
                </div>
            )}

            {file && status !== "success" && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleUpload}
                        disabled={isPending}
                        className="px-12 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:shadow-2xl hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-orange-100"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <FileIcon size={18} />
                        )}
                        {isPending ? "Processing Data..." : "Synchronize Activity"}
                    </button>
                </div>
            )}
        </div>
    );
}
