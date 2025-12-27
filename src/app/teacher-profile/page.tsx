'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { ClassEntry } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Clock, Star, UserCheck, BookOpen, Users, LogOut, Package, Info } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { MultiSelectFilter } from '@/components/dashboard/multi-select-filter';

const parseNumericValue = (
  value: string | number | undefined | null
): number => {
  if (value === null || value === undefined) return 0;
  const stringValue = String(value).trim();
  if (stringValue === '' || stringValue === '-') return 0;
  const cleanedValue = stringValue.replace(/,/g, '');
  const numberValue = parseFloat(cleanedValue);
  return isNaN(numberValue) ? 0 : numberValue;
};

type CourseBreakdown = {
  [courseName: string]: number;
}

type TeacherStats = {
  name: string;
  classCount: number;
  totalDuration: number;
  totalAverageAttendance: number;
  avgAttendance: number;
  highestPeakAttendance: number;
  classes: ClassEntry[];
  highestAttendanceClass: ClassEntry | null;
  courseBreakdown: CourseBreakdown;
  uniqueCourses: string[];
  uniqueProductTypes: string[];
};

export default function TeacherProfilePage() {
  const [data, setData] = useState<ClassEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  useEffect(() => {
    const session = localStorage.getItem('dashboard_session');
    if (!session) {
      router.replace('/login');
      return;
    }

    const handleImport = async (url: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetUrl: url }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch data from sheet.');
        }

        const sheetData = await response.json();
        setData(sheetData);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description:
            error.message ||
            'Could not import data. Please check the URL and try again.',
        });
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const initialSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    if (initialSheetUrl) {
      handleImport(initialSheetUrl);
    } else {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description:
          'Google Sheet URL is not configured in environment variables.',
      });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const teacherStats = useMemo(() => {
    const stats: { [key: string]: TeacherStats } = {};

    data.forEach(item => {
      const teacherName = item.teacher1;
      if (!teacherName) return;

      if (!stats[teacherName]) {
        stats[teacherName] = {
          name: teacherName,
          classCount: 0,
          totalDuration: 0,
          totalAverageAttendance: 0,
          avgAttendance: 0,
          highestPeakAttendance: 0,
          classes: [],
          highestAttendanceClass: null,
          courseBreakdown: {},
          uniqueCourses: [],
          uniqueProductTypes: [],
        };
      }

      stats[teacherName].classCount += 1;
      stats[teacherName].totalDuration += parseNumericValue(
        item.totalDurationMinutes
      );
      stats[teacherName].totalAverageAttendance += parseNumericValue(
        item.averageAttendance
      );
      stats[teacherName].classes.push(item);
      
      if(item.course) {
        stats[teacherName].courseBreakdown[item.course] = (stats[teacherName].courseBreakdown[item.course] || 0) + 1;
      }

      const peakAttendance = parseNumericValue(item.highestAttendance);
      if (peakAttendance > stats[teacherName].highestPeakAttendance) {
        stats[teacherName].highestPeakAttendance = peakAttendance;
        stats[teacherName].highestAttendanceClass = item;
      }
    });

    Object.values(stats).forEach(t => {
      t.avgAttendance =
        t.classCount > 0
          ? Math.round(t.totalAverageAttendance / t.classCount)
          : 0;
      t.uniqueCourses = [...new Set(t.classes.map(c => c.course).filter(Boolean))];
      t.uniqueProductTypes = [...new Set(t.classes.map(c => c.productType).filter(Boolean))];
    });

    return stats;
  }, [data]);
  
  const teachers = useMemo(() => Object.keys(teacherStats).sort(), [teacherStats]);
  
  const selectedTeacherStats = useMemo(() => {
    return selectedTeachers.map(teacherName => teacherStats[teacherName]).filter(Boolean);
  }, [selectedTeachers, teacherStats]);

  const handleLogout = () => {
    localStorage.removeItem('dashboard_session');
    router.replace('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar>
        <Button variant="ghost" onClick={() => router.push('/')}>
            Home
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </Navbar>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Teacher Profile
          </h1>
          <p className="text-muted-foreground">
            Select teachers to view and compare their performance statistics.
          </p>
        </div>

        <div className="mb-8">
            {isLoading ? (
                <Skeleton className="h-10 w-full md:w-[300px]" />
            ) : (
                <MultiSelectFilter
                    title="Select teachers..."
                    options={teachers.map(t => ({ value: t, label: t }))}
                    selectedValues={selectedTeachers}
                    onSelectedValuesChange={setSelectedTeachers}
                    triggerClassName="w-full md:w-[400px]"
                />
            )}
        </div>
        
        {isLoading && selectedTeachers.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
        )}
        
        {selectedTeacherStats.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {selectedTeacherStats.map(currentTeacherStats => (
                    <div key={currentTeacherStats.name} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">{currentTeacherStats.name}</CardTitle>
                                <CardDescription>Performance Overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-4 rounded-lg border p-4">
                                        <Award className="h-8 w-8 text-chart-1" />
                                        <div>
                                            <p className="text-muted-foreground">Classes Taught</p>
                                            <p className="text-2xl font-bold">{currentTeacherStats.classCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg border p-4">
                                        <Users className="h-8 w-8 text-chart-2" />
                                        <div>
                                            <p className="text-muted-foreground">Avg. Attendance</p>
                                            <p className="text-2xl font-bold">{currentTeacherStats.avgAttendance.toLocaleString()}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-4 rounded-lg border p-4">
                                        <BookOpen className="h-8 w-8 text-chart-3" />
                                        <div>
                                            <p className="text-muted-foreground">Courses Taught</p>
                                            <p className="text-2xl font-bold">{currentTeacherStats.uniqueCourses.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg border p-4">
                                        <Package className="h-8 w-8 text-chart-6" />
                                        <div>
                                            <p className="text-muted-foreground">Product Types</p>
                                            <p className="text-2xl font-bold">{currentTeacherStats.uniqueProductTypes.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg border p-4 col-span-1 md:col-span-2">
                                        <Star className="h-8 w-8 text-chart-5" />
                                        <div className="flex-1 flex justify-between items-center">
                                            <div>
                                                <p className="text-muted-foreground">Highest Peak Attendance</p>
                                                <p className="text-2xl font-bold">{currentTeacherStats.highestPeakAttendance.toLocaleString()}</p>
                                            </div>
                                            {currentTeacherStats.highestAttendanceClass && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto max-w-xs">
                                                        <div className="space-y-1">
                                                          <h4 className="font-semibold">Highest Attendance Class</h4>
                                                          <p className="text-sm">
                                                              {currentTeacherStats.highestAttendanceClass.topic}
                                                          </p>
                                                          <p className="text-xs text-muted-foreground">
                                                              {currentTeacherStats.highestAttendanceClass.date}
                                                          </p>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg border p-4">
                                        <Clock className="h-8 w-8 text-chart-4" />
                                        <div>
                                            <p className="text-muted-foreground">Total Duration</p>
                                            <p className="text-2xl font-bold">{currentTeacherStats.totalDuration.toLocaleString()} min</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead className="text-right">Classes Taught</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(currentTeacherStats.courseBreakdown).sort(([, a], [, b]) => b - a).map(([course, count]) => (
                                            <TableRow key={course}>
                                                <TableCell className="font-medium">{course}</TableCell>
                                                <TableCell className="text-right font-bold">{count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="font-bold">Total</TableCell>
                                            <TableCell className="text-right font-bold">{currentTeacherStats.classCount}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </CardContent>
                        </Card>

                        <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">
                            Class History ({currentTeacherStats.classCount})
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-right">Avg. Attendance</TableHead>
                                    <TableHead className="text-right">Peak Attendance</TableHead>
                                    <TableHead className="text-right">Duration (min)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentTeacherStats.classes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell><Badge variant="secondary">{c.date}</Badge></TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">{c.topic}</TableCell>
                                        <TableCell>{c.course}</TableCell>
                                        <TableCell className="text-right">{parseNumericValue(c.averageAttendance).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{parseNumericValue(c.highestAttendance).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{parseNumericValue(c.totalDurationMinutes).toLocaleString()}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            </ScrollArea>
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {!isLoading && selectedTeachers.length === 0 && (
             <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                <UserCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Select a Teacher</h2>
                <p className="text-muted-foreground mt-2">Choose one or more teachers from the dropdown above to see their detailed performance cards.</p>
            </div>
        )}
      </main>
    </div>
  );
}

    