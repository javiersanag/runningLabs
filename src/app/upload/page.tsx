import { Dropzone } from "@/components/ingestion/Dropzone";

export default function UploadPage() {
    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">Upload Activity</h2>
                    <p className="text-neutral-500 font-medium">Drag and drop your training files to sync with RunningLabs. Supported formats: <span className="text-primary font-bold">.FIT</span>, <span className="text-primary font-bold">.GPX</span>, <span className="text-primary font-bold">.TCX</span></p>
                </div>

                <div className="max-w-2xl mx-auto mt-20">
                    <Dropzone />
                </div>
            </div>
        </>
    );
}
