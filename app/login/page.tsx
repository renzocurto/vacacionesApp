export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
          🏖️
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Vacaciones de invierno</h1>
        {error ? (
          <p className="mt-2 text-sm text-rose-600">
            Ese link no es válido. Pedile al admin que te comparta tu link personal de acceso.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Para entrar necesitás tu link personal de acceso — te lo tiene que compartir el admin
            (por mail, WhatsApp o el canal que usen). No hay usuario ni contraseña.
          </p>
        )}
      </div>
    </main>
  );
}
