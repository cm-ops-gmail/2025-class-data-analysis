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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Award, Clock, Star, UserCheck, BookOpen, Users, LogOut } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

type TeacherStats = {
  name: string;
  classCount: number;
  totalDuration: number;
  totalAverageAttendance: number;
  avgAttendance: number;
  highestPeakAttendance: number;
  classes: ClassEntry[];
  highestAttendanceClass: ClassEntry | null;
};

export default function TeacherProfilePage() {
  const [data, setData] = useState<ClassEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

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
    });

    return stats;
  }, [data]);
  
  const teachers = useMemo(() => Object.keys(teacherStats).sort(), [teacherStats]);
  
  const currentTeacherStats = selectedTeacher ? teacherStats[selectedTeacher] : null;

  const handleLogout = () => {
    localStorage.removeItem('dashboard_session');
    router.replace('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar>
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
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
            Select a teacher to view their performance statistics.
          </p>
        </div>

        <div className="mb-8">
          <Select onValueChange={setSelectedTeacher} value={selectedTeacher || ''}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a teacher..." />
            </SelectTrigger>
            <SelectContent>
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading teachers...</div>
                ) : (
                    <ScrollArea className="h-72">
                        {teachers.map(teacher => (
                            <SelectItem key={teacher} value={teacher}>
                                {teacher}
                            </SelectItem>
                        ))}
                    </ScrollArea>
                )}
            </SelectContent>
          </Select>
        </div>

        {isLoading && !currentTeacherStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
        )}
        
        {currentTeacherStats && (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{currentTeacherStats.name}</CardTitle>
                        <CardDescription>Performance Overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                                <Star className="h-8 w-8 text-chart-5" />
                                <div>
                                    <p className="text-muted-foreground">Highest Peak</p>
                                    <p className="text-2xl font-bold">{currentTeacherStats.highestPeakAttendance.toLocaleString()}</p>
                                    {currentTeacherStats.highestAttendanceClass && <p className="text-xs truncate text-muted-foreground" title={currentTeacherStats.highestAttendanceClass.topic}>
                                        in "{currentTeacherStats.highestAttendanceClass.topic}"
                                    </p>}
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
                
                <Separator />

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
        )}
        
        {!isLoading && !selectedTeacher && (
             <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                <UserCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Select a Teacher</h2>
                <p className="text-muted-foreground mt-2">Choose a teacher from the dropdown above to see their detailed performance card.</p>
            </div>
        )}
      </main>
    </div>
  );
}
