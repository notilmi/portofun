import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSession } from "@/server/actions/auth";
import { getMaterialById } from "@/server/actions/learning-center/material.actions";
import ClientPage from "./_components/client.page";

type PageProps = {
  params: Promise<{ courseId: string; chapterId: string; materialId: string }>;
};

async function MaterialContent({ params }: PageProps) {
  const { courseId, chapterId, materialId } = await params;

  const user = await getSession();
  if (!user) {
    notFound();
  }

  let material;
  try {
    material = await getMaterialById({ id: materialId, includeQuizQuestions: true });
  } catch {
    notFound();
  }

  if (!material || material.chapterId !== chapterId) {
    notFound();
  }

  if (material.type.trim().toLowerCase() !== "quiz") {
    notFound();
  }

  return (
    <ClientPage
      courseId={courseId}
      chapterId={chapterId}
      userId={user.id}
      material={{
        id: material.id,
        title: material.title,
        quizQuestions: material.quizQuestions ?? [],
      }}
    />
  );
}

export default function MaterialPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading quiz...</div>}
    >
      <MaterialContent params={params} />
    </Suspense>
  );
}
