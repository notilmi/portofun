"use client";

import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DeleteMaterialDialog from "./delete-material-dialog";
import EditChapterDialog from "./edit-chapter-dialog";

type ChapterDetail = {
  id: string;
  courseId: string;
  title: string;
  sequenceOrder: number;
};

type MaterialItem = {
  id: string;
  chapterId: string;
  title: string;
  type: "markdown" | "video" | "quiz";
  sequenceOrder: number;
  isArchived: boolean;
};

type ClientPageProps = {
  courseId: string;
  initialChapter: ChapterDetail;
  initialMaterials: MaterialItem[];
};

export default function ClientPage({
  courseId,
  initialChapter,
  initialMaterials,
}: ClientPageProps) {
  const [chapter, setChapter] = useState<ChapterDetail>(initialChapter);
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | null>(
    null,
  );

  // When server props change (e.g. after router.refresh()), sync local state
  useEffect(() => {
    setChapter(initialChapter);
  }, [initialChapter]);

  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  const handleDeleteClick = (material: MaterialItem) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    // Optimistically remove from UI
    setMaterials((prev) => prev.filter((m) => m.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/learning-center/dashboard/admin/courses/${courseId}`}>
            <ArrowLeftIcon />
            Back to Course
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{chapter.title}</h1>
          <p className="text-sm text-muted-foreground">
            Chapter {chapter.sequenceOrder} - Manage Materials
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditChapterDialogOpen(true)}>
          <PencilIcon />
          Edit Chapter
        </Button>
      </div>

      {/* Chapter Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Information</CardTitle>
          <CardDescription>Details about this chapter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium">Title</p>
            <p className="text-sm text-muted-foreground">{chapter.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Sequence Order</p>
            <p className="text-sm text-muted-foreground">
              Chapter {chapter.sequenceOrder}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Materials</p>
            <p className="text-sm text-muted-foreground">
              {materials.filter((m) => !m.isArchived).length} active,{" "}
              {materials.filter((m) => m.isArchived).length} archived
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Materials Section */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Materials</CardTitle>
            <CardDescription>
              Manage learning materials for this chapter.
            </CardDescription>
          </div>
          <Button asChild>
            <Link
              href={`/learning-center/dashboard/admin/courses/${courseId}/${chapter.id}/material/new`}
            >
              Add Material
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No materials yet. Start by adding the first material.
            </p>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Material {material.sequenceOrder} - {material.type}
                    </p>
                    <p className="font-medium">{material.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/learning-center/dashboard/admin/courses/${courseId}/${chapter.id}/material/${material.id}/edit`}
                      >
                        <PencilIcon />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(material)}
                    >
                      <Trash2Icon />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {materialToDelete && (
        <DeleteMaterialDialog
          material={{
            id: materialToDelete.id,
            title: materialToDelete.title,
          }}
          courseId={courseId}
          chapterId={chapter.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      {/* Edit Chapter Dialog */}
      <EditChapterDialog
        chapter={{
          id: chapter.id,
          title: chapter.title,
        }}
        open={editChapterDialogOpen}
        onOpenChange={setEditChapterDialogOpen}
      />
    </div>
  );
}
