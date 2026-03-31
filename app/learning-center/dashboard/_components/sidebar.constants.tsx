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
