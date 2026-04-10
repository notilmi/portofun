export type DashboardRoute = {
  label: string;
  href: string;
};

export const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    label: "🚀 Dasbor",
    href: "/learning-center/dashboard",
  },
  {
    label: "📚 Katalog",
    href: "/learning-center/dashboard/catalog",
  },
  {
    label: "📖 Pembelajaran Saya",
    href: "/learning-center/dashboard/my-learnings",
  },
];

export const ADMIN_DASHBOARD_ROUTES: DashboardRoute[] = DASHBOARD_ROUTES.concat(
  [
    {
      label: "🎓 Manajemen Kursus",
      href: "/learning-center/dashboard/admin/courses",
    },
  ],
);

export function getDashboardRoutes(isAdmin: boolean): DashboardRoute[] {
  return isAdmin ? ADMIN_DASHBOARD_ROUTES : DASHBOARD_ROUTES;
}
