import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0];

    return (
        <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-semibold tracking-tight">
                    Hi, {name} 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                    Welcome to Lumen. Your journey starts here.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Your account</p>
                        <p className="text-lg font-medium mt-1">{user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Joined {new Date(user?.created_at || "").toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                        <p className="text-lg font-medium mt-1">Cycle tracking</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            We&apos;re building this for you.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                        <p className="text-lg font-medium mt-1">Daily insights</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            AI-powered patterns from your data.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}