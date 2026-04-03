"use server";

import prisma from "@/server/db/db";
import { getSessionThrowable } from "@/server/actions/auth";

export type DashboardInsights = {
  activeCount: number;
  completedCount: number;
  droppedCount: number;
  completedMaterialsCount: number;
};

export async function getDashboardInsights(): Promise<DashboardInsights> {
  // Intentionally uncached: depends on request headers/session.
  const session = await getSessionThrowable(false);
  const userId = session.id;

  const [activeCount, completedCount, droppedCount, completedMaterials] =
    await Promise.all([
      prisma.enrollment.count({ where: { userId, status: "ACTIVE" } }),
      prisma.enrollment.count({ where: { userId, status: "COMPLETED" } }),
      prisma.enrollment.count({ where: { userId, status: "DROPPED" } }),
      prisma.userProgress.findMany({
        where: {
          userId,
          completedAt: { not: null },
          material: { isArchived: false },
        },
        distinct: ["materialId"],
        select: { materialId: true },
      }),
    ]);

  return {
    activeCount,
    completedCount,
    droppedCount,
    completedMaterialsCount: completedMaterials.length,
  };
}
