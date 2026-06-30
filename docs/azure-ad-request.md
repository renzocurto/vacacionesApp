# Pedido a IT: registrar app para login con Microsoft (Entra ID)

## Qué es esto
Estamos testeando una app interna para coordinar las vacaciones de invierno (reemplazo del Excel compartido). Para que cada empleado entre con el mismo usuario y contraseña que ya usa en Windows/Outlook/Teams, necesitamos que la app quede registrada como una aplicación dentro de **Microsoft Entra ID** (antes llamado Azure Active Directory) — el mismo sistema que ya usan para el login único de la oficina.

Esto **no es tocar DNS ni infraestructura de mail**: es un registro de aplicación dentro del panel de administración de Microsoft 365 que ya manejan, algo habitual cuando se conecta cualquier herramienta externa (ej. Slack, Zoom, etc.) con el login corporativo.

## Qué necesitamos que hagan
1. Entrar a **portal.azure.com** → buscar **"Microsoft Entra ID"** → **App registrations** → **New registration**.
2. Completar:
   - **Name**: `App Vacaciones (test)`
   - **Supported account types**: "Accounts in this organizational directory only" (single tenant — solo gente de la oficina, nadie externo puede loguearse)
   - **Redirect URI**: tipo *Web*, valor: `https://<dominio-de-la-app>.vercel.app/api/auth/callback/microsoft-entra-id`
     (les paso la URL final exacta apenas tengamos el deploy hecho; mientras tanto pueden dejarlo en blanco y agregarlo después)
3. Una vez creada la app registration, en la sección **Certificates & secrets** → **New client secret**, generar un secreto y copiarlo (solo se muestra una vez).
4. En **API permissions**, confirmar que están los permisos por defecto `User.Read` y `openid`, `profile`, `email` (vienen incluidos por defecto al crear la app, no hay que agregar nada extra).

## Qué necesitamos que nos pasen (de forma segura, no por mail abierto)
- **Tenant ID** (o "Directory ID") — está en la pantalla de Overview de Entra ID.
- **Client ID** (Application ID) — está en la pantalla de Overview de la app registrada.
- **Client Secret** — el valor que generaron en el paso 3.

## Qué NO hace esto
- No le da acceso a la app a correos, archivos, calendarios ni nada de Microsoft 365 — solo lee el nombre y el email de quien inicia sesión, para identificarlo.
- No es un login abierto: solo entran personas que ya tienen una cuenta dentro de la organización (single tenant).
- No modifica nada de la configuración existente de Microsoft 365, Outlook, Teams ni del Active Directory.
- Se puede dar de baja en cualquier momento eliminando la "app registration" desde el mismo panel, sin dejar rastros.

## Qué necesitamos de vuelta
Confirmación de que pueden crear la app registration, y los 3 datos (Tenant ID, Client ID, Client Secret) para conectar la app.
