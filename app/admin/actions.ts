"use server";

import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admins";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("No autorizado");
  }
}

export async function createTeam(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const team = await prisma.team.create({ data: { name } });
  await prisma.teamWeekQuota.createMany({
    data: [
      { teamId: team.id, week: 1, maxSlots: 0 },
      { teamId: team.id, week: 2, maxSlots: 0 },
    ],
  });
  revalidatePath("/admin");
}

export async function updateQuota(formData: FormData) {
  await assertAdmin();
  const teamId = String(formData.get("teamId"));
  const week = Number(formData.get("week"));
  const maxSlots = Number(formData.get("maxSlots"));

  await prisma.teamWeekQuota.upsert({
    where: { teamId_week: { teamId, week } },
    create: { teamId, week, maxSlots },
    update: { maxSlots },
  });
  revalidatePath("/admin");
}

export async function createEmployee(formData: FormData) {
  await assertAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const teamId = String(formData.get("teamId"));
  if (!email || !name || !teamId) return;

  await prisma.user.create({ data: { email, name, teamId } });
  revalidatePath("/admin");
}

export async function deleteEmployee(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));

  const target = await prisma.user.findUniqueOrThrow({ where: { id } });
  if (isAdminEmail(target.email)) {
    throw new Error("No se puede eliminar a un admin.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}
