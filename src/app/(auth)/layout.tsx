export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Initiative Forge</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            D&D 5e Combat Tracker & Campaign Manager
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
