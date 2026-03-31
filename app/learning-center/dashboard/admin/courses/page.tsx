import ClientPage from "./_components/client.page";
import { getCourses } from "@/server/actions/learning-center/course.actions";

export default async function AdminCoursesPage() {
	const courses = await getCourses({
		orderBy: "createdAt",
		orderDirection: "desc",
	});

	return <ClientPage initialCourses={courses} />;
}
