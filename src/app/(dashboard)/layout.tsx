import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, LogOut, LayoutDashboard, Droplet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold text-lg">Lumen</span>
                        </Link>
                        <nav className="hidden sm:flex items-center gap-1">
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/cycle">
                                    <Droplet className="h-4 w-4 mr-2" />
                                    Cycles
                                </Link>
                            </Button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {user.email}
                        </span>
                        <form action="/auth/signout" method="post">
                            <Button type="submit" variant="ghost" size="sm">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    );
}