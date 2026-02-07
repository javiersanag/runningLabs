import { Sidebar } from "./Sidebar";

export function Shell({ children, athlete }: { children: React.ReactNode, athlete?: any }) {
    return (
        <div className="flex min-h-screen w-full">
            <Sidebar athlete={athlete} />
            <main className="flex-1 ml-64 p-8 relative min-h-screen">
                <div className="mx-auto max-w-7xl relative z-10 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

