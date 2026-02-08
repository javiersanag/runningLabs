import { Navbar } from "./Navbar";

export function Shell({ children, athlete }: { children: React.ReactNode, athlete?: any }) {
    return (
        <div className="min-h-screen w-full bg-neutral-50/30">
            <Navbar athlete={athlete} />
            <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                {children}
            </main>
        </div>
    );
}

