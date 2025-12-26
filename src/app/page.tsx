"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { classEntries as initialClassEntries } from "@/lib/data";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClassEntry } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { Loader, Search, BookOpen, User, BookCopy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [data, setData] = useState<ClassEntry[]>(initialClassEntries);
  const [sheetUrl, setSheetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [globalFilter, setGlobalFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [teacher1Filter, setTeacher1Filter] = useState("all");

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

  const productTypes = useMemo(
    () => ["all", ...new Set(data.map((item) => item.productType))],
    [data]
  );
  const courses = useMemo(
    () => ["all", ...new Set(data.map((item) => item.course))],
    [data]
  );
  const teachers = useMemo(
    () => ["all", ...new Set(data.map((item) => item.teacher1))],
    [data]
  );

  const filteredData = useMemo(() => {
    let filtered = data;

    if (productTypeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.productType === productTypeFilter
      );
    }
    if (courseFilter !== "all") {
      filtered = filtered.filter((item) => item.course === courseFilter);
    }
    if (teacher1Filter !== "all") {
      filtered = filtered.filter((item) => item.teacher1 === teacher1Filter);
    }

    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();
      filtered = filtered.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedFilter)
        );
      });
    }

    return filtered;
  }, [data, globalFilter, productTypeFilter, courseFilter, teacher1Filter]);
  
  const summary = useMemo(() => {
    return {
      total: data.length,
      filtered: filteredData.length,
      courses: new Set(filteredData.map(item => item.course)).size,
      teachers: new Set(filteredData.map(item => item.teacher1)).size
    }
  }, [data, filteredData]);


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

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.filtered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.courses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Teachers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.teachers}</div>
            </CardContent>
          </Card>
        </div>


        <DataTable 
          data={filteredData} 
          allColumns={allColumns} 
          productTypes={productTypes}
          courses={courses}
          teachers={teachers}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          productTypeFilter={productTypeFilter}
          setProductTypeFilter={setProductTypeFilter}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          teacher1Filter={teacher1Filter}
          setTeacher1Filter={setTeacher1Filter}
          onDataUpdate={setData}
        />
      </main>
    </div>
  );
}

const allColumns = [
  { key: "date", header: "Date", sortable: true },
  { key: "scheduledTime", header: "Scheduled Time", sortable: true },
  { key: "productType", header: "Product Type", sortable: true },
  { key: "course", header: "Course", sortable: true },
  { key: "subject", header: "Subject", sortable: true },
  { key: "topic", header: "Topic", sortable: true },
  { key: "teacher1", header: "Teacher 1", sortable: true },
  { key: "studio", header: "Studio", sortable: true },
  { key: "opsStakeholder", header: "Ops Stakeholder", sortable: true },
  { key: "highestAttendance", header: "Highest Attendance", sortable: true },
  { key: "averageAttendance", header: "Average Attendance", sortable: true },
  { key: "totalComments", header: "Total Comments", sortable: true },
  { key: "entryTime", header: "Entry Time" },
  { key: "slideQAC", header: "Slide QAC" },
  { key: "classStartTime", header: "Class Start Time" },
  { key: "teacher2", header: "Teacher 2" },
  { key: "teacher3", header: "Teacher 3" },
  { key: "studioCoordinator", header: "Studio Coordinator" },
  { key: "lectureSlide", header: "Lecture Slide" },
  { key: "title", header: "Title" },
  { key: "caption", header: "Caption" },
  { key: "crossPost", header: "Cross Post" },
  { key: "sourcePlatform", header: "Source Platform" },
  { key: "teacherConfirmation", header: "Teacher Confirmation" },
  { key: "zoomLink", header: "Zoom Link" },
  { key: "zoomCredentials", header: "Zoom Credentials" },
  { key: "moderatorLink", header: "Moderator Link" },
  { key: "annotatedSlideLink", header: "Annotated Slide" },
  { key: "classStopTimestamps", header: "Class Stop Timestamps" },
  { key: "startDelayMinutes", header: "Start Delay (min)" },
  { key: "totalDurationMinutes", header: "Total Duration (min)" },
  { key: "viewCount10Min", header: "Views (10 Min)" },
  { key: "viewCount40_50Min", header: "Views (40-50 Min)" },
  { key: "viewCountBeforeEnd", header: "Views (End)" },
  { key: "classLink", header: "Class LINK" },
  { key: "recordingLink", header: "Recording Link" },
  { key: "classQACFeedback", header: "QAC Feedback" },
  { key: "remarks", header: "Remarks" },
];
