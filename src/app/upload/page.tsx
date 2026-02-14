import { Dropzone } from "@/components/ingestion/Dropzone";
import { PageHeader } from "@/components/ui/PageHeader";

export default function UploadPage() {
    return (
        <>
            <div className="max-w-4xl mx-auto">
                <PageHeader
                    title="Upload Activity"
                    subtitle="Drag and drop your training files to sync with Khronos. Supported formats: .FIT, .GPX, .TCX"
                    className="mb-12"
                />

                <div className="max-w-2xl mx-auto mt-20">
                    <Dropzone />
                </div>
            </div>
        </>
    );
}
