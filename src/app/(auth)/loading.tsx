export default function AuthLoading() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-muted rounded-md animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  );
}
