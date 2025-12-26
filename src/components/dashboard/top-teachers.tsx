"use client";

import { useMemo } from 'react';
import type { ClassEntry } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Star, UserCheck } from 'lucide-react';

interface TopTeachersProps {
  data: ClassEntry[];
}

const parseNumericValue = (value: string | number | undefined | null): number => {
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
  highestPeakAttendance: number;
};

export function TopTeachers({ data }: TopTeachersProps) {
  const topTeachers = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        byClassCount: [],
        byAverageAttendance: [],
        byHighestAttendance: [],
        byTotalDuration: [],
      };
    }

    const teacherStats: { [key: string]: TeacherStats } = {};

    data.forEach(item => {
      const teacherName = item.teacher1;
      if (!teacherName) return;

      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = {
          name: teacherName,
          classCount: 0,
          totalDuration: 0,
          totalAverageAttendance: 0,
          highestPeakAttendance: 0,
        };
      }

      teacherStats[teacherName].classCount += 1;
      teacherStats[teacherName].totalDuration += parseNumericValue(item.totalDurationMinutes);
      teacherStats[teacherName].totalAverageAttendance += parseNumericValue(item.averageAttendance);
      
      const peakAttendance = parseNumericValue(item.highestAttendance);
      if (peakAttendance > teacherStats[teacherName].highestPeakAttendance) {
        teacherStats[teacherName].highestPeakAttendance = peakAttendance;
      }
    });

    const statsArray = Object.values(teacherStats);
    
    const byClassCount = [...statsArray].sort((a, b) => b.classCount - a.classCount).slice(0, 3);
    
    const byAverageAttendance = [...statsArray]
      .map(t => ({ ...t, avgAttendance: t.classCount > 0 ? Math.round(t.totalAverageAttendance / t.classCount) : 0 }))
      .sort((a, b) => b.avgAttendance - a.avgAttendance)
      .slice(0, 3);
      
    const byHighestAttendance = [...statsArray].sort((a, b) => b.highestPeakAttendance - a.highestPeakAttendance).slice(0, 3);
    
    const byTotalDuration = [...statsArray].sort((a, b) => b.totalDuration - a.totalDuration).slice(0, 3);

    return { byClassCount, byAverageAttendance, byHighestAttendance, byTotalDuration };
  }, [data]);
  
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Classes Taught</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {topTeachers.byClassCount.map((teacher, index) => (
              <li key={index} className="flex justify-between">
                <span>{teacher.name}</span>
                <span className="font-bold">{teacher.classCount} classes</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Average Attendance</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {topTeachers.byAverageAttendance.map((teacher, index) => (
              <li key={index} className="flex justify-between">
                <span>{teacher.name}</span>
                <span className="font-bold">{teacher.avgAttendance.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Peak Attendance</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {topTeachers.byHighestAttendance.map((teacher, index) => (
              <li key={index} className="flex justify-between">
                <span>{teacher.name}</span>
                <span className="font-bold">{teacher.highestPeakAttendance.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Total Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {topTeachers.byTotalDuration.map((teacher, index) => (
              <li key={index} className="flex justify-between">
                <span>{teacher.name}</span>
                <span className="font-bold">{teacher.totalDuration.toLocaleString()} min</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
