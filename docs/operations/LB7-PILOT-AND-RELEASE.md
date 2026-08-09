# LB-7 — QA, seguridad, persistencia, piloto y preparación de V1.0

## Objetivo

Convertir el recorrido funcional de LB-1 a LB-6 en una base apta para un piloto controlado, con persistencia, seguridad, recuperación, auditoría y una puerta de liberación verificable. LB-7 no declara por sí sola que el sistema pueda desplegarse en producción administrativa sin las decisiones de infraestructura, identidad, protección de datos y operación del organismo receptor.

## Criterios de aceptación técnica

1. Todas las puertas LB-1 a LB-6 continúan en verde en el mismo HEAD.
2. Los expedientes sobreviven a reinicios mediante un repositorio persistente con escritura atómica, checksum y permisos restrictivos.
3. Existe copia de seguridad recuperable y manifiesto de backup.
4. Las operaciones relevantes generan una cadena de auditoría SHA-256 verificable y sensible a manipulación.
5. En producción la API no arranca sin credenciales configuradas.
6. Los permisos distinguen VIEWER, OPERATOR, REVIEWER y ADMIN; la validación humana exige al menos REVIEWER.
7. La API aplica límites de tamaño y cabeceras de seguridad; los errores de autenticación/autorización se distinguen de errores de datos.
8. Los DOCX/PDF administrativos no exponen IDs de fuentes internas, nombres de ficheros ni estados técnicos; la trazabilidad permanece en el modelo estructurado y la auditoría. Las referencias a artículos/normas que procedan permanecen en la redacción jurídica.
9. Existe prueba automatizada de persistencia, corrupción, backup, auditoría, RBAC y limpieza de salida documental.
10. EVENT_SERVICES y la revisión jurídica preventiva están integrados en el workflow persistente, pero sus pantallas especializadas deben quedar terminadas antes del piloto de usuario final.
11. Existe imagen de contenedor y arranque específico de piloto detrás de HTTPS, sin modificar el comportamiento local seguro del servidor ordinario.
12. Se realiza piloto funcional con casos representativos y revisión humana antes de etiquetar V1.0.

## Matriz mínima de piloto

El piloto deberá incluir, como mínimo, casos del alcance normativo actualmente soportado y variantes que ejerciten:

- entrada guiada completa;
- Ficha de Datos completa;
- modo híbrido con ficha parcial;
- Necesidad e Idoneidad integrada en Memoria y como informe independiente;
- Insuficiencia de medios integrada y separada;
- valor estimado en ambos lados de los umbrales modelados en LB-4;
- no división en lotes con motivación aportada y caso sin motivación suficiente;
- subrogación `UNKNOWN` para verificar que no se inventa una conclusión;
- protección de datos activada y desactivada;
- documento adicional solicitado en lenguaje simple;
- un caso EVENT_SERVICES con hechos técnicos completos y otro con un dato activado ausente para comprobar el bloqueo por no invención;
- un caso con revisión jurídica preventiva `REVIEW_REQUIRED` y otro `READY_FOR_HUMAN_LEGAL_REFERRAL`;
- reinicio del servidor entre captura y generación para comprobar persistencia;
- restauración desde backup en un entorno aislado.

## Revisión documental del piloto

Para cada expediente, una persona tramitadora deberá revisar al menos Memoria, PCAP y PPT y registrar:

- corrección de datos y coherencia cruzada;
- suficiencia de la motivación;
- corrección de referencias normativas visibles;
- ausencia de metadatos técnicos o fuentes internas en el documento final;
- adecuación de estructura y estilo al modelo administrativo aplicable;
- necesidad de ajustes manuales y motivo.

Los hallazgos se clasificarán como BLOQUEANTE, MAYOR, MENOR o MEJORA. No se propondrá V1.0 con defectos BLOQUEANTES o MAYORES abiertos.

## Despliegue piloto

La rama LB-7 dispone de `Dockerfile`, arranque `scripts/start-pilot.mjs` e instrucciones en `docs/operations/LB7-PILOT-HTTPS-DEPLOYMENT.md`. El contenedor escucha internamente en `0.0.0.0:3000` y debe permanecer detrás de un terminador HTTPS/proxy o plataforma gestionada. Los datos se montan en volumen persistente y los secretos se suministran mediante configuración segura del entorno.

El despliegue técnico puede prepararse sin decidir todavía la infraestructura corporativa definitiva. Para entregar una URL real de prueba sí será necesario elegir un alojamiento piloto HTTPS y disponer de acceso/credenciales para desplegar allí.

## Seguridad y operación

La autenticación local por token de LB-7 es un control técnico de piloto, no sustituye la futura integración con el proveedor corporativo de identidad. Para un despliegue real se deberá decidir e integrar el mecanismo institucional de autenticación/autorización, TLS/terminación segura, gestión de secretos, política de retención, copias de seguridad operadas, registros centralizados, protección de datos y continuidad de servicio.

Los secretos nunca se almacenarán en el repositorio. En `NODE_ENV=production` o con `CONTRATA_IA_AUTH_REQUIRED=1` el arranque exige credenciales configuradas mediante variables de entorno o mecanismo equivalente del entorno de despliegue.

## Puerta V1.0

La etiqueta V1.0 solo podrá proponerse cuando:

- CI completa esté verde;
- `npm run audit:lb7` esté verde;
- las pantallas especializadas necesarias para el piloto estén disponibles en la interfaz;
- las pruebas de piloto estén documentadas;
- no existan defectos BLOQUEANTES/MAYORES;
- la normativa y los modelos documentales del alcance estén vigentes y revalidados;
- se haya documentado la arquitectura de despliegue e identidad elegida;
- exista aceptación humana explícita del piloto.

Hasta entonces el estado correcto es **candidato a piloto**, no producción general.
