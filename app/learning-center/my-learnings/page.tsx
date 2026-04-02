import Link from "next/link";

export default function MyLearningsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">My Learnings</h1>
      <p className="text-sm text-muted-foreground">
        My Learnings is not implemented yet.
      </p>
      <Link href="/learning-center/dashboard" className="text-sm underline">
        Back to dashboard
      </Link>
    </div>
  );
}
