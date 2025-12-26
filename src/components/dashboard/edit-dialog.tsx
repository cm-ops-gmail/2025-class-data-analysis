"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClassEntry } from "@/lib/definitions";
import { useForm, Controller } from "react-hook-form";

interface EditDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classEntry: ClassEntry;
  onSave: (data: ClassEntry) => void;
  columns: { key: keyof ClassEntry; header: string }[];
}

export function EditDialog({
  isOpen,
  setIsOpen,
  classEntry,
  onSave,
  columns,
}: EditDialogProps) {
  const { control, handleSubmit } = useForm<ClassEntry>({
    defaultValues: classEntry,
  });

  const onSubmit = (data: ClassEntry) => {
    onSave(data);
  };

  const longTextColumns: (keyof ClassEntry)[] = ['caption', 'crossPost', 'sourcePlatform', 'teacherConfirmation', 'title'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>
            Make changes to the class details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {columns.map(({ key, header }) => (
                <div key={key} className={longTextColumns.includes(key) ? "md:col-span-2" : ""}>
                  <Label htmlFor={key} className="text-right">
                    {header}
                  </Label>
                  <Controller
                    name={key}
                    control={control}
                    render={({ field }) => (
                      longTextColumns.includes(key) ? (
                        <Textarea
                          id={key}
                          {...field}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={key}
                          {...field}
                          className="mt-1"
                        />
                      )
                    )}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
