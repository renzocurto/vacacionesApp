import { getCurrentUser, destroySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admins";
import { chooseWeek } from "@/app/actions";

export default async function Home() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const me = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: { team: { include: { quotas: true, users: { include: { assignment: true } } } }, assignment: true },
  });

  const week1Max = me.team.quotas.find((q) => q.week === 1)?.maxSlots ?? 0;
  const week2Max = me.team.quotas.find((q) => q.week === 2)?.maxSlots ?? 0;
  const week1Used = me.team.users.filter((u) => u.assignment?.week === 1).length;
  const week2Used = me.team.users.filter((u) => u.assignment?.week === 2).length;

  const canPickWeek = (week: 1 | 2) => {
    if (me.assignment?.week === week) return true;
    const used = week === 1 ? week1Used : week2Used;
    const max = week === 1 ? week1Max : week2Max;
    return used < max;
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Hola, {me.name} 👋</h1>
          <p className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {me.team.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isAdminEmail(me.email) && (
            <Link
              href="/admin"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Admin
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await destroySession();
              redirect("/login");
            }}
          >
            <button type="submit" className="text-sm text-slate-400 hover:text-slate-600">
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-medium text-slate-900">Elegí tu semana de vacaciones</h2>
        <p className="mt-1 text-sm text-slate-500">
          La semana que no elijas, quedás de guardia. Podés cambiar tu elección mientras haya
          cupo en tu equipo.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {([1, 2] as const).map((week) => {
            const used = week === 1 ? week1Used : week2Used;
            const max = week === 1 ? week1Max : week2Max;
            const selected = me.assignment?.week === week;
            const disabled = !canPickWeek(week);
            const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
            return (
              <form
                key={week}
                action={async () => {
                  "use server";
                  await chooseWeek(week);
                }}
              >
                <button
                  type="submit"
                  disabled={disabled}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    selected
                      ? "border-indigo-500 bg-indigo-50"
                      : disabled
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Semana {week}</span>
                    {selected && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                        Elegida ✓
                      </span>
                    )}
                    {!selected && disabled && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Sin cupo
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${selected ? "bg-indigo-500" : "bg-slate-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {used}/{max} ocupados en tu equipo
                  </div>
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-medium text-slate-900">Tu equipo</h2>
        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Vacaciones</th>
                <th className="px-3 py-2">Guardia</th>
              </tr>
            </thead>
            <tbody>
              {me.team.users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-800">{u.name}</td>
                  <td className="px-3 py-2">
                    {u.assignment ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Semana {u.assignment.week}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin elegir</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {u.assignment ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Semana {u.assignment.week === 1 ? 2 : 1}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
