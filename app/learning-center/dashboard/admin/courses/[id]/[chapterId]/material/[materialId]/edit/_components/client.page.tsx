"use client";

import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { updateMaterial } from "@/server/actions/learning-center/material.actions";
import MaterialForm from "../../../_components/material-form";
import type { MaterialFormValues } from "../../../_components/material-form-schema";

type MaterialDetail = {
  id: string;
  chapterId: string;
  title: string;
  type: "markdown" | "video" | "quiz";
  content: string | null;
  videoUrl: string | null;
  quizQuestions?: NonNullable<MaterialFormValues["quizQuestions"]>;
  sequenceOrder: number;
};

type ChapterDetail = {
  id: string;
  title: string;
  sequenceOrder: number;
};

type ClientPageProps = {
  material: MaterialDetail;
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

export default function ClientPage({
  material,
  chapter,
  courseId,
}: ClientPageProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | undefined>(undefined);

  const handleSubmit = async (values: MaterialFormValues): Promise<boolean> => {
    setFeedback(undefined);

    // Build update payload - only include fields that should be sent
    const updatePayload: {
      id: string;
      title: string;
      type: "markdown" | "video" | "quiz";
      content?: string;
      videoUrl?: string;
      quizQuestions?: NonNullable<MaterialFormValues["quizQuestions"]>;
    } = {
      id: material.id,
      title: values.title,
      type: values.type,
    };

    // Only add content/videoUrl if they match the material type
    if (values.type === "markdown" && values.content) {
      updatePayload.content = values.content;
    }
    if (values.type === "video" && values.videoUrl) {
      updatePayload.videoUrl = values.videoUrl;
    }
    if (values.type === "quiz" && values.quizQuestions) {
      updatePayload.quizQuestions = values.quizQuestions;
    }

    // Call updateMaterial server action
    const response = await updateMaterial(updatePayload);

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
          <h1 className="text-2xl font-bold">Edit Material</h1>
          <p className="text-sm text-muted-foreground">
            Chapter {chapter.sequenceOrder}: {chapter.title} · Material{" "}
            {material.sequenceOrder}
          </p>
        </div>
        <Button type="submit" form="material-form">
          <SaveIcon />
          Save Changes
        </Button>
      </div>

      {/* Form - borderless, directly on page */}
      <MaterialForm
        mode="update"
        onSubmit={handleSubmit}
        formId="material-form"
        hideSubmitButton
        initialValues={{
          title: material.title,
          type: material.type,
          content: material.content ?? "",
          videoUrl: material.videoUrl ?? "",
          quizQuestions: material.quizQuestions ?? [],
        }}
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
