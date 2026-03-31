export type DashboardRoute = {
  label: string;
  href: string;
};

export const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    label: "Dashboard",
    href: "/learning-center/dashboard",
  },
  {
    label: "Katalog",
    href: "/learning-center/catalog",
  },
  {
    label: "Pembelajaran Saya",
    href: "/learning-center/my-learnings",
  },
];

export const ADMIN_DASHBOARD_ROUTES: DashboardRoute[] = DASHBOARD_ROUTES.concat(
  [
    {
      label: "Manajemen Kursus",
      href: "/learning-center/admin/courses",
    },
  ],
);

export function getDashboardRoutes(isAdmin: boolean): DashboardRoute[] {
  return isAdmin ? ADMIN_DASHBOARD_ROUTES : DASHBOARD_ROUTES;
}
