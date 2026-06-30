import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  createTeam,
  updateQuota,
  createEmployee,
  deleteEmployee,
} from "@/app/admin/actions";
import { CopyLinkButton } from "@/app/admin/CopyLinkButton";
import { isAdminEmail } from "@/lib/admins";

export default async function AdminPage() {
  const teams = await prisma.team.findMany({
    include: { quotas: true, users: { include: { assignment: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-lg font-semibold text-slate-900">Panel de admin</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/" className="font-medium text-slate-500 hover:text-slate-700">
            ← Volver
          </Link>
          <a
            href="/admin/export"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
          >
            Exportar CSV
          </a>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-medium text-slate-900">Crear equipo</h2>
        <form action={createTeam} className="mt-3 flex gap-2">
          <input
            name="name"
            placeholder="Nombre del equipo"
            required
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Crear
          </button>
        </form>
      </section>

      {teams.map((team) => {
        const week1 = team.quotas.find((q) => q.week === 1);
        const week2 = team.quotas.find((q) => q.week === 2);
        const week1Used = team.users.filter((u) => u.assignment?.week === 1).length;
        const week2Used = team.users.filter((u) => u.assignment?.week === 2).length;

        return (
          <section
            key={team.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h2 className="text-base font-semibold text-slate-900">{team.name}</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { week: 1, used: week1Used, max: week1?.maxSlots ?? 0 },
                { week: 2, used: week2Used, max: week2?.maxSlots ?? 0 },
              ].map(({ week, used, max }) => (
                <form
                  key={week}
                  action={updateQuota}
                  className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm"
                >
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="week" value={week} />
                  <span className="text-slate-600">
                    Semana {week} <span className="text-slate-400">({used} ocupados)</span>
                  </span>
                  <input
                    type="number"
                    name="maxSlots"
                    min={0}
                    defaultValue={max}
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Guardar
                  </button>
                </form>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Link personal</th>
                    <th className="px-3 py-2">Elección</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {team.users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{u.name}</td>
                      <td className="px-3 py-2 text-slate-500">{u.email}</td>
                      <td className="px-3 py-2">
                        <CopyLinkButton path={`/e/${u.token}`} />
                      </td>
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
                        {isAdminEmail(u.email) ? (
                          <span className="text-xs text-slate-400">Admin</span>
                        ) : (
                          <form action={deleteEmployee}>
                            <input type="hidden" name="id" value={u.id} />
                            <button
                              type="submit"
                              className="text-xs font-medium text-rose-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form action={createEmployee} className="flex flex-wrap gap-2">
              <input type="hidden" name="teamId" value={team.id} />
              <input
                name="name"
                placeholder="Nombre"
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <input
                name="email"
                type="email"
                placeholder="email@empresa.com"
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Agregar empleado
              </button>
            </form>
          </section>
        );
      })}
    </div>
  );
}
