"use client";

import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [materials] = useState<MaterialItem[]>(initialMaterials);

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
          <h1 className="text-2xl font-bold">{initialChapter.title}</h1>
          <p className="text-sm text-muted-foreground">
            Chapter {initialChapter.sequenceOrder} - Manage Materials
          </p>
        </div>
        <Button variant="outline" size="sm">
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
            <p className="text-sm text-muted-foreground">{initialChapter.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Sequence Order</p>
            <p className="text-sm text-muted-foreground">
              Chapter {initialChapter.sequenceOrder}
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
          <Button>Add Material</Button>
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
                    <Button size="sm" variant="outline">
                      <PencilIcon />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
