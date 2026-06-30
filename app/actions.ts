"use server";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function chooseWeek(week: 1 | 2) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("No autenticado");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: { team: { include: { quotas: true } }, assignment: true },
  });

  const quota = user.team.quotas.find((q) => q.week === week);
  const maxSlots = quota?.maxSlots ?? 0;

  const occupied = await prisma.assignment.count({
    where: {
      week,
      user: { teamId: user.teamId },
      userId: { not: user.id },
    },
  });

  if (occupied >= maxSlots) {
    throw new Error("Ya no hay cupo en esa semana para tu equipo.");
  }

  await prisma.assignment.upsert({
    where: { userId: user.id },
    create: { userId: user.id, week },
    update: { week },
  });

  revalidatePath("/");
}
