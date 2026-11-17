# LB98 — Vertical Concession físico operativo · cierre de ingeniería

## Alcance

LB98 queda implementado por subtipo. `SERVICE_CONCESSION` y `WORKS_CONCESSION` disponen de perfiles físicos independientes. No se reutiliza un PCAP de servicios para concesión de obras, ni un PCAP Works ordinario para una concesión.

`engineeringClosed` no significa `productionReady`: todos los perfiles continúan sujetos a validación humana y a las validaciones institucionales posteriores de la hoja de ruta.

## Autoridad documental y normativa

- LCSP: arts. 14.4 y 15 para riesgo operacional; arts. 247-250 para preparación de concesión de obras; art. 285.2 para estudio de viabilidad en concesión de servicios, además del resto del régimen concesional aplicable.
- No se ha localizado en el catálogo vigente de modelos recomendados de la Junta una familia general de PCAP de concesiones comparable a Supply, Service o Works.
- Caso real `SERVICE_CONCESSION`: concesión de cafetería y máquinas expendedoras del Hospital Universitario de Puerto Real, con PCAP, PPT, memoria y estudio de viabilidad. Es autoridad de contraste/regresión y nunca plantilla general.
- Caso real `WORKS_CONCESSION`: aparcamientos del nuevo Hospital de Málaga, con estudio de viabilidad aprobado y documentación de proyecto. Es autoridad de preparación/regresión y nunca plantilla general.

## SERVICE_CONCESSION — perfil físico

Cuatro activos derivados Contrata-IA, todos `officialModel=false` y `humanValidationRequired=true`:

1. PCAP `contrata-ia:concession:pcap:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `76d6a9999bf77064c8a655feaaf54f9178df3066eac2d4583188b1b56d3c7a8f`
2. Memoria `contrata-ia:concession:memory:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `d64b5e6923d23d5b5824bb527e1222ec31cbcac001e09c438dab019b5ab53b90`
3. PPT `contrata-ia:concession:ppt:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `2786a0d0d584dcb4e1349be679ac2c314e38cd02abe06814ef22cb727fbe0ce2`
4. Estudio de viabilidad `contrata-ia:concession:viability:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `60bccd4c427b6da3a8317a9b8fa4ef6eb9af2b0f8c3c0060f0dcba6a20f9b035`

Los cuatro binarios están persistidos en Supabase; longitud y SHA calculados desde los bytes decodificados coinciden con los manifiestos.

## WORKS_CONCESSION — perfil físico

Cuatro activos específicos, derivados de Contrata-IA y trazados a LCSP 247-250 + autoridad Málaga, también `officialModel=false` y `humanValidationRequired=true`:

1. PCAP `contrata-ia:concession:pcap:works:LB98-WORKS-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `a5b1dbf2191e99ded1a06981fde4bdc720a0299b06de0fdf1b8f1a2cb151649a`
2. Memoria `contrata-ia:concession:memory:works:LB98-WORKS-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `c66bb816bee9b224472911f72852a82fd3431ba388907cdf8cceb693694669e2`
3. PPT `contrata-ia:concession:ppt:works:LB98-WORKS-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `370cf9c6a8a405e0dcd1e568f0b3325be1fd02fb28539fdca139bf9052102135`
4. Estudio de viabilidad `contrata-ia:concession:viability:works:LB98-WORKS-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `b9855bc0150e636cd79ee0e274be537d9b78af634d56d25a54927a067912fdc5`

Los cuatro SHA fueron recalculados desde PostgreSQL sobre el contenido base64 persistido y coinciden exactamente con los manifiestos.

## Persistencia

- `contrata_ia_template_assets` admite `PCAP`, `MEMORIA`, `PPT` y `VIABILITY` como tipos explícitos.
- `VIABILITY` no se almacena bajo otro tipo documental.
- La Edge Function `contrata-ia-persistence` está desplegada en versión 6 y mantiene autenticación por token, validación de tamaño, base64 y SHA.
- El store HTTP verifica identidad, tipo, media type, SHA, huella de estilo, procedencia, longitud y SHA calculado de los bytes antes de entregar un activo al renderer.

## Gates jurídicos y documentales

### Comunes

- `ConcessionRiskOperationalGate`: exige transferencia real de riesgo operacional y bloquea recuperación garantizada incompatible con la calificación concesional.
- `ConcessionViabilityContentGate`: controla demanda, inversiones/financiación, costes/ingresos, VAN/tasa, matriz de riesgos y ayudas de Estado.
- `ConcessionGeneralTemplatePhysicalGate`: verifica SHA, estructura ODT, estilo, slots y procedencia.
- `ConcessionGeneralEditableTemplateRenderer`: no infiere decisiones materiales pendientes.
- `ConcessionUserJourneyCoordinator`: exige validación humana expresa de los campos aplicables antes de documentos.

### Works Concession

`WorksConcessionPreparationGate` incorpora:

- estudio de viabilidad del art. 247;
- decisión expresa sobre anteproyecto del art. 248;
- cuando la Administración define íntegramente las obras, proyecto y gates técnicos de contenido, supervisión, aprobación y replanteo por la vía correspondiente;
- decisión expresa sobre la aplicabilidad del informe de evaluación financiera;
- ninguna condición `null` se convierte silenciosamente en `false` o `NO APLICA`.

El recorrido de usuario incorpora los campos del overlay Works Concession a la validación humana y el cierre físico exige además que este gate esté resuelto.

## Generación física

### Service Concession

`ConcessionUserDocumentPackageGenerator` produce:

- PCAP;
- Memoria;
- PPT;
- Estudio de Viabilidad;
- `manifest.json`.

Audita hechos transversales como objeto, CPV, VE, riesgo y VAN.

### Works Concession

`WorksConcessionUserDocumentPackageGenerator` produce las mismas cuatro familias documentales con perfil propio y audita además la solución de proyecto/preparación de obra.

El runtime `/concession` selecciona el store, autoridad y generador por `concession.subtype`. Un subtipo no resuelto bloquea la generación. Nunca existe fallback automático entre Service y Works Concession.

## Evidencia E2E y CI

- `lb98-concession-package-e2e.test.ts`: E2E físico de `SERVICE_CONCESSION` con los mismos cuatro binarios persistidos.
- `lb98-works-concession-package-e2e.test.ts`: E2E físico de `WORKS_CONCESSION` con los mismos cuatro binarios persistidos; verifica SHA, `officialModel=false`, paquete de cuatro documentos y auditorías.
- `lb98-works-concession-preparation.test.ts`: regresiones de arts. 247-250, incluyendo decisiones no resueltas y gates de proyecto.
- CI #2586 (`33147546616`): `SUCCESS` con typecheck, tests, build productivo, smoke tests, arquitectura, conocimiento, normativa, documentos y seguridad en verde.

## Cierre LB98

Cierre de ingeniería del vertical físico concesional:

- `SERVICE_CONCESSION` physical profile: **operational**
- `WORKS_CONCESSION` physical profile: **operational**
- riesgo operacional: **gate obligatorio**
- viabilidad: **gate obligatorio**
- separación física por subtipo: **obligatoria**
- validación humana: **obligatoria**
- casos reales promovidos como modelos generales: **no**
- `productionReady`: **false**

LB98 puede considerarse **engineering closed** para su objetivo de hoja de ruta. El siguiente bloque es LB99 — orquestación de contratos mixtos, sin plantilla genérica falsa y con control de prestación principal/separabilidad.
