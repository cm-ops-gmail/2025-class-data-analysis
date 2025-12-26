"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { classEntries as initialClassEntries } from "@/lib/data";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClassEntry } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<ClassEntry[]>(initialClassEntries);
  const [sheetUrl, setSheetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheetUrl) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid Google Sheet URL.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch data from sheet.");
      }

      const sheetData = await response.json();
      setData(sheetData);
      toast({
        title: "Success!",
        description: "Data imported successfully from your Google Sheet.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.message ||
          "Could not import data. Please check the URL and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Paste your public Google Sheet URL to get started.
            </p>
          </div>
          <div className="flex w-full max-w-xl items-center space-x-2">
            <Input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/..."
              aria-label="Google Sheet URL"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Import
            </Button>
          </div>
        </div>

        <DataTable initialData={data} />
      </main>
    </div>
  );
}
