"use client";

import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createMaterial } from "@/server/actions/learning-center/material.actions";
import MaterialForm from "../../_components/material-form";
import type { MaterialFormValues } from "../../_components/material-form-schema";

type ChapterDetail = {
  id: string;
  courseId: string;
  title: string;
  sequenceOrder: number;
};

type ClientPageProps = {
  chapter: ChapterDetail;
  courseId: string;
};

type ActionError = {
  code: string;
  error: string;
};

function isActionError(value: unknown): value is ActionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "error" in value
  );
}

export default function ClientPage({ chapter, courseId }: ClientPageProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | undefined>(undefined);

  const handleSubmit = async (
    values: MaterialFormValues,
  ): Promise<boolean> => {
    setFeedback(undefined);

    // Build payload (avoid sending undefined fields - can break server action serialization)
    const payload: {
      chapterId: string;
      title: string;
      type: "markdown" | "video" | "quiz";
      content?: string;
      videoUrl?: string;
      quizQuestions?: NonNullable<MaterialFormValues["quizQuestions"]>;
    } = {
      chapterId: chapter.id,
      title: values.title,
      type: values.type,
    };

    if (values.type === "markdown" && values.content) {
      payload.content = values.content;
    }
    if (values.type === "video" && values.videoUrl) {
      payload.videoUrl = values.videoUrl;
    }
    if (values.type === "quiz" && values.quizQuestions) {
      payload.quizQuestions = values.quizQuestions;
    }

    const response = await createMaterial(payload);

    // Check for errors
    if (isActionError(response)) {
      setFeedback(response.error);
      return false;
    }

    // Success - redirect back to chapter page
    router.refresh(); // Force revalidation of server components
    router.push(
      `/learning-center/dashboard/admin/courses/${courseId}/${chapter.id}`,
    );
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/learning-center/dashboard/admin/courses/${courseId}/${chapter.id}`}
          >
            <ArrowLeftIcon />
            Back to Chapter
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Material</h1>
          <p className="text-sm text-muted-foreground">
            Chapter {chapter.sequenceOrder}: {chapter.title}
          </p>
        </div>
        <Button type="submit" form="material-form">
          <PlusIcon />
          Create Material
        </Button>
      </div>

      {/* Form - borderless, directly on page */}
      <MaterialForm
        mode="create"
        onSubmit={handleSubmit}
        formId="material-form"
        hideSubmitButton
      />
      
      {/* Error Feedback */}
      {feedback && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feedback}
        </div>
      )}
    </div>
  );
}
