import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function DashboardLoading() {
    return (
        <>
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-24 hidden md:block" />
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg flex items-center gap-1">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-x-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[140px] p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-x-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[140px] p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 flex flex-col h-[320px]">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="flex-1 w-full rounded-xl" />
                </Card>
                <Card className="flex flex-col h-[320px]">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="flex-1 w-full rounded-xl" />
                </Card>
            </div>
        </>
    );
}
