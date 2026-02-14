import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";

export default function FeedLoading() {
    return (
        <>
            <PageHeader
                title="Activity Feed"
                subtitle="Recent activities from you and your friends."
                actions={<Skeleton className="h-10 w-32" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Panel Skeleton */}
                <div className="hidden md:block md:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <div className="flex flex-col items-center">
                            <Skeleton className="w-20 h-20 rounded-full mb-4" />
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-24 mb-6" />
                            <div className="w-full grid grid-cols-3 gap-2 text-center border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Feed Skeleton */}
                <div className="md:col-span-6 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <div className="p-4 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <div className="grid grid-cols-3 gap-4 py-4 border-y border-neutral-100 dark:border-neutral-800">
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-48 w-full" /> {/* Map placeholder */}
                        </div>
                    ))}
                </div>

                {/* Right Panel Skeleton */}
                <div className="hidden md:block md:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
