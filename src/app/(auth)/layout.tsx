import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-border/40">
                <div className="mx-auto max-w-6xl px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg">Lumen</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">{children}</div>
            </main>
        </div>
    );
}