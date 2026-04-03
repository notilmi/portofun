"use client";

import Link from "next/link";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type DangerZoneProps = {
  isDeleteCourseDialogOpen: boolean;
  onDeleteCourseDialogOpenChange: (open: boolean) => void;
  deleteConfirmInput: string;
  onDeleteConfirmInputChange: (value: string) => void;
  onDeleteCourse: () => Promise<void>;
};

export default function DangerZone({
  isDeleteCourseDialogOpen,
  onDeleteCourseDialogOpenChange,
  deleteConfirmInput,
  onDeleteConfirmInputChange,
  onDeleteCourse,
}: DangerZoneProps) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Area Berbahaya</CardTitle>
        <CardDescription>
          Tindakan ini akan menghapus kursus ini dan semua bab terkait secara permanen.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Dialog
          open={isDeleteCourseDialogOpen}
          onOpenChange={onDeleteCourseDialogOpenChange}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2Icon />
              Hapus Kursus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Kursus</DialogTitle>
              <DialogDescription>
                Ketik DELETE untuk mengonfirmasi penghapusan permanen kursus ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Input
                value={deleteConfirmInput}
                onChange={(event) => onDeleteConfirmInputChange(event.target.value)}
                placeholder="Ketik DELETE"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onDeleteCourseDialogOpenChange(false);
                    onDeleteConfirmInputChange("");
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmInput !== "DELETE"}
                  onClick={() => void onDeleteCourse()}
                >
                  Konfirmasi Hapus
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" asChild>
          <Link href="/learning-center/dashboard/admin/courses">Kembali ke Kursus</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
