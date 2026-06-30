import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admins";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { team: true, assignment: true },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });

  const header = "equipo,nombre,email,vacaciones,guardia";
  const rows = users.map((u) => {
    const vac = u.assignment ? `Semana ${u.assignment.week}` : "Sin elegir";
    const guard = u.assignment ? `Semana ${u.assignment.week === 1 ? 2 : 1}` : "";
    return [u.team.name, u.name, u.email, vac, guard].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=vacaciones.csv",
    },
  });
}
