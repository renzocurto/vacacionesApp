# Pedido a Infraestructura: registros DNS para envío de mails (Resend)

## Qué es esto
Estamos testeando una app interna para coordinar las vacaciones de invierno (reemplazo del Excel compartido). Para que la app pueda mandar el mail de acceso a cada empleado, necesitamos un proveedor de envío de mails transaccionales (usamos **Resend**, similar a SendGrid/Mailgun).

Resend **no administra casillas de correo ni accede al mail institucional** — solo necesita permiso para enviar mails *desde* un subdominio nuevo y aislado.

## Subdominio propuesto
`vacaciones.fepba.gov.ar`

Usar un subdominio (y no `fepba.gov.ar` directamente) significa que esto queda completamente separado del mail corporativo normal. Si en algún momento quieren cortar el servicio, simplemente se borran estos registros y no afecta nada más.

## Qué necesitamos que agreguen
Una vez que el subdominio esté dado de alta en Resend, nos da 3-4 registros para sumar al DNS (en el panel donde tengan alojado el dominio `fepba.gov.ar`, ej. Cloudflare, Route53, etc.):

| Tipo  | Para qué sirve |
|-------|-----------------|
| TXT   | Verifica que somos dueños del subdominio |
| CNAME | DKIM — firma digital que evita que los mails caigan en spam (suelen ser 2 o 3 registros) |
| TXT (opcional) | SPF/MX si en algún momento se quiere recibir respuestas a esos mails (no es necesario para este caso, es solo envío) |

Los valores exactos (nombre del registro y el contenido) los generamos recién cuando Resend confirme el subdominio — apenas infraestructura nos dé el OK para usar `vacaciones.fepba.gov.ar`, los sacamos y se los pasamos para que los carguen.

## Qué NO cambia
- No se toca nada del dominio principal `fepba.gov.ar`.
- No se crean ni modifican casillas de correo existentes.
- No hay acceso de Resend a nada fuera de este subdominio nuevo.

## Qué necesitamos de vuelta
Confirmación de que `vacaciones.fepba.gov.ar` (o el subdominio que prefieran) está autorizado, para generar los registros reales y coordinar quién los carga en el DNS.
