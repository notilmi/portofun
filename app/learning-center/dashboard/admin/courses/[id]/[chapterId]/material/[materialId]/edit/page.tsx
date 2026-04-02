import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getChapterById } from "@/server/actions/learning-center/chapter.actions";
import { getMaterialById } from "@/server/actions/learning-center/material.actions";
import ClientPage from "./_components/client.page";

type PageProps = {
  params: Promise<{ id: string; chapterId: string; materialId: string }>;
};

async function EditMaterialContent({ params }: PageProps) {
  const { id, chapterId, materialId } = await params;

  // Fetch material and chapter data in parallel
  // Note: These actions throw errors if not found, so we wrap in try-catch
  let material;
  let chapter;

  try {
    [material, chapter] = await Promise.all([
      getMaterialById({ id: materialId, includeQuizQuestions: true }),
      getChapterById({ id: chapterId }),
    ]);
  } catch {
    // If either material or chapter not found, show 404
    notFound();
  }

  // Validate material belongs to this chapter
  if (material.chapterId !== chapterId) {
    notFound();
  }

  return (
    <ClientPage
      courseId={id}
      chapter={{
        id: chapter.id,
        title: chapter.title,
        sequenceOrder: chapter.sequenceOrder,
      }}
      material={{
        id: material.id,
        chapterId: material.chapterId,
        title: material.title,
        type: material.type as "markdown" | "video" | "quiz",
        content: material.content,
        videoUrl: material.videoUrl,
        quizQuestions: material.quizQuestions ?? [],
        sequenceOrder: material.sequenceOrder,
      }}
    />
  );
}

export default function EditMaterialPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading material...</div>
      }
    >
      <EditMaterialContent params={params} />
    </Suspense>
  );
}
