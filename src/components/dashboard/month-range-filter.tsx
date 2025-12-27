"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";

interface MonthRangeFilterProps {
  startMonth?: string;
  setStartMonth: (month?: string) => void;
  endMonth?: string;
  setEndMonth: (month?: string) => void;
  monthNames: string[];
}

export function MonthRangeFilter({
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  monthNames,
}: MonthRangeFilterProps) {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-2">
            <Label htmlFor="start-month" className="text-sm font-medium">Start Month</Label>
            <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger id="start-month" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select start month" />
                </SelectTrigger>
                <SelectContent>
                    {monthNames.map((month) => (
                    <SelectItem key={`start-${month}`} value={month}>
                        {month}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
         <div className="flex items-center gap-2">
            <Label htmlFor="end-month" className="text-sm font-medium">End Month</Label>
            <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger id="end-month" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select end month" />
                </SelectTrigger>
                <SelectContent>
                    {monthNames.map((month) => (
                    <SelectItem key={`end-${month}`} value={month}>
                        {month}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}
