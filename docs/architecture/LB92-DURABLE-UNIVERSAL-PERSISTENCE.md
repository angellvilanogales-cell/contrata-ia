# LB92 — Persistencia universal durable

## Objetivo

Cerrar la diferencia entre la persistencia adaptativa existente y el estado de un expediente universal sin depender del disco efímero de Render Free.

## Decisión

Se introduce `UniversalDurableCaseStore` como frontera canónica de snapshots universales y `HttpUniversalCaseMirror` como adaptador hacia la función Supabase `contrata-ia-persistence`.

El snapshot contiene `caseId`, `schemaVersion`, `payload` y SHA-256 del JSON enviado. El store mantiene copia local de proceso como fallback, pero la durabilidad real depende de que el espejo remoto confirme la escritura.

## Reglas de seguridad

1. No se persisten secretos dentro del snapshot.
2. El token del espejo solo se toma del entorno; nunca se incorpora al código ni al documento.
3. Un checksum inválido bloquea la restauración.
4. Una versión de esquema distinta bloquea la restauración; no existe migración silenciosa.
5. El `caseId` recuperado debe coincidir exactamente con el solicitado.
6. Fallar el espejo remoto no se presenta como persistencia durable: se devuelve `LOCAL_ONLY_REMOTE_FAILED`.
7. La restauración prefiere remoto válido; solo cae al local cuando el remoto falla y existe copia local válida.

## Persistencia Supabase

Tabla `public.contrata_ia_universal_cases`:
- RLS habilitado;
- sin privilegios para `anon`/`authenticated`;
- operaciones concedidas únicamente a `service_role`;
- payload JSONB, versión de esquema, checksum SHA-256 y timestamps.

La función Edge existente conserva las rutas adaptativas y añade `/universal/:caseId` para GET/PUT, validando autenticación custom y checksum antes del upsert.

## Límite de cierre

Este bloque acredita infraestructura y regresiones de persistencia universal, pero **no** acredita todavía la prueba desplegada `create → restart/redeploy → recover` del servicio Render. Esa prueba requiere una acción real de reinicio/redeploy del runtime y se mantiene como gate externo antes de `productionReady`.

## Coste

La solución reutiliza Render Free + Supabase Free y mantiene coste adicional obligatorio de 0 €.
