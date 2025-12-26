"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Columns,
  X,
  Edit,
} from "lucide-react";
import type { ClassEntry } from "@/lib/definitions";
import { EditDialog } from "./edit-dialog";
import { useToast } from "@/hooks/use-toast";

type ColumnDef = {
  key: keyof ClassEntry;
  header: string;
  sortable?: boolean;
};

const allColumns: ColumnDef[] = [
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

const defaultVisibleColumns: (keyof ClassEntry)[] = [
  "date",
  "scheduledTime",
  "productType",
  "course",
  "subject",
  "topic",
  "teacher1",
  "highestAttendance",
];

type SortConfig = {
  key: keyof ClassEntry;
  direction: "ascending" | "descending";
} | null;

interface DataTableProps {
  initialData: ClassEntry[];
}

export function DataTable({ initialData }: DataTableProps) {
  const { toast } = useToast();
  const [data, setData] = React.useState<ClassEntry[]>(initialData);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [productTypeFilter, setProductTypeFilter] = React.useState("all");
  const [editingRow, setEditingRow] = React.useState<ClassEntry | null>(null);

  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<keyof ClassEntry, boolean>
  >(() => {
    const visibility: Record<string, boolean> = {};
    for (const col of allColumns) {
      visibility[col.key] = defaultVisibleColumns.includes(
        col.key as keyof ClassEntry
      );
    }
    return visibility as Record<keyof ClassEntry, boolean>;
  });

  const visibleColumns = React.useMemo(
    () => allColumns.filter((col) => columnVisibility[col.key]),
    [columnVisibility]
  );

  const productTypes = React.useMemo(
    () => ["all", ...new Set(data.map((item) => item.productType))],
    [data]
  );

  const filteredData = React.useMemo(() => {
    let filtered = data;

    if (productTypeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.productType === productTypeFilter
      );
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
  }, [data, globalFilter, productTypeFilter]);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        const numA = parseFloat(aValue.replace(/,/g, ''));
        const numB = parseFloat(bValue.replace(/,/g, ''));

        let valA, valB;
        if (!isNaN(numA) && !isNaN(numB)) {
          valA = numA;
          valB = numB;
        } else {
          valA = aValue.toLowerCase();
          valB = bValue.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const requestSort = (key: keyof ClassEntry) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleSave = (updatedRow: ClassEntry) => {
    setData((prevData) =>
      prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    setEditingRow(null);
    toast({
      title: "Success",
      description: "Entry updated successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full md:w-[250px] lg:w-[350px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
            <SelectTrigger className="w-full md:w-[250px] lg:w-[300px] h-10">
              <SelectValue placeholder="Filter by product type..." />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Product Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Columns className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  className="capitalize"
                  checked={columnVisibility[column.key]}
                  onCheckedChange={(value) =>
                    setColumnVisibility((prev) => ({
                      ...prev,
                      [column.key]: !!value,
                    }))
                  }
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => requestSort(col.key as keyof ClassEntry)}
                      className="-ml-4"
                    >
                      {col.header}
                      {sortConfig?.key === col.key ? (
                        sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-30" />
                      )}
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <TableRow key={row.id}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} className="max-w-[250px] truncate">
                      {row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingRow(row)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Row</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {editingRow && (
        <EditDialog
          isOpen={!!editingRow}
          setIsOpen={(open) => !open && setEditingRow(null)}
          classEntry={editingRow}
          onSave={handleSave}
          columns={allColumns}
        />
      )}
    </div>
  );
}
