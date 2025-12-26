import { DataTable } from "@/components/dashboard/data-table";
import { classEntries } from "@/lib/data";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Class Dashboard
          </h1>
          <p className="text-muted-foreground">
            A customizable, interactive view of your Google Sheet data.
          </p>
        </div>

        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-semibold">Import Your Data</h2>
            <p className="text-sm text-muted-foreground">
              Paste your Google Sheet URL to get started. For now, we're using
              sample data to demonstrate the dashboard features.
            </p>
          </div>
          <div className="flex w-full max-w-xl items-center space-x-2">
            <Input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/..."
              aria-label="Google Sheet URL"
            />
            <Button type="submit">Import</Button>
          </div>
        </div>

        <DataTable initialData={classEntries} />
      </main>
    </div>
  );
}
