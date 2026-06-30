import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { token } });
  if (!user) {
    redirect("/login?error=1");
  }
  await createSession(user.id);
  redirect("/");
}
