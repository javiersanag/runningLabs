import { Dropzone } from "@/components/ingestion/Dropzone";

export default function UploadPage() {
    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Upload Activity</h2>
                <p className="text-white/50">Supported formats: .FIT, .GPX, .TCX</p>
            </div>

            <div className="max-w-xl mx-auto mt-12">
                <Dropzone />
            </div>
        </>
    );
}
