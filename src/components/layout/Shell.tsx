import { Navbar } from "./Navbar";
import { BottomTabBar } from "./BottomTabBar";

export function Shell({ children, athlete }: { children: React.ReactNode, athlete?: any }) {
    return (
        <div className="min-h-screen w-full bg-neutral-50/30">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
            >
                Skip to main content
            </a>
            <Navbar athlete={athlete} />
            <main id="main-content" className="pt-24 pb-20 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                {children}
            </main>
            <BottomTabBar />
        </div>
    );
}

