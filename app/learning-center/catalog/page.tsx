import Link from "next/link";

export default function CatalogPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <p className="text-sm text-muted-foreground">
        Catalog is not implemented yet.
      </p>
      <Link href="/learning-center/dashboard" className="text-sm underline">
        Back to dashboard
      </Link>
    </div>
  );
}
