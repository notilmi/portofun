import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getChaptersByCourse } from "@/server/actions/learning-center/chapter.actions";
import { getCourseById } from "@/server/actions/learning-center/course.actions";
import ClientPage from "./_components/client.page";

type PageProps = {
	params: Promise<{ id: string }>;
};

async function AdminCourseInternalContent({ params }: PageProps) {
	const { id } = await params;

	const [course, chapters] = await Promise.all([
		getCourseById({ id }),
		getChaptersByCourse({ courseId: id }),
	]);

	if (!course) {
		notFound();
	}

	return (
		<ClientPage
			initialCourse={{
				id: course.id,
				title: course.title,
				description: course.description,
				isArchived: course.isArchived,
			}}
			initialChapters={chapters.map((chapter) => ({
				id: chapter.id,
				title: chapter.title,
				sequenceOrder: chapter.sequenceOrder,
			}))}
		/>
	);
}

export default function AdminCourseInternalPage({ params }: PageProps) {
	return (
		<Suspense fallback={<div className="text-sm text-muted-foreground">Loading course...</div>}>
			<AdminCourseInternalContent params={params} />
		</Suspense>
	);
}
