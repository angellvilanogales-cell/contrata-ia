# LB100 — Procedencia normativa y conocimiento · cierre técnico de gobernanza

## Autoridades productivas

La base normativa productiva se vincula a fuentes oficiales y versionadas. El registro canónico es `knowledge/sources/lb100-authoritative-sources.yaml`.

Autoridades principales:

- BOE — Ley 9/2017, de Contratos del Sector Público, texto consolidado, con última actualización publicada el 9 de abril de 2026.
- Junta de Andalucía — catálogo de modelos recomendados de pliegos y contratos, actualización de modelos referenciada a diciembre de 2025.
- BOE — Real Decreto 311/2022, Esquema Nacional de Seguridad, para controles de seguridad posteriores.
- RGPD y LOPDGDD para protección de datos.
- Expedientes reales acreditados de la Junta como evidencia de casuística/regresión, nunca como norma ni modelo general por sí mismos.

## Política de conocimiento

- Una búsqueda web es evidencia para localizar/verificar fuentes; no es autoridad normativa por sí misma.
- El conocimiento histórico sin `sourceId` resoluble y autoridad acreditada queda en **cuarentena**.
- El contenido en cuarentena puede orientar búsquedas y comparaciones, pero no decidir automáticamente cláusulas materiales, vigencia normativa ni carácter oficial de un modelo.
- Una afirmación de `officialModel=true` requiere identidad binaria exacta previa.
- Las decisiones materiales conservan validación humana.

## Gratuidad de generación

La ruta base de generación documental no depende de una API de IA comercial obligatoria. PCAP, Memoria, PPT, estudios y ZIP se producen mediante motores deterministas del repositorio y activos documentales persistidos.

El audit `scripts/audit-lb100-source-governance.mjs` bloquea dependencias obligatorias de SDK/API generativa comercial en la ruta base y endpoints directos de proveedores de pago en los verticales documentales LB96-LB99.

Esta regla significa **sin coste obligatorio de IA por documento**. No implica que hosting, almacenamiento, dominio, red o futura infraestructura institucional sean necesariamente gratuitos.

## Evidencia

- `tests/lb100-source-governance.test.ts` protege autoridades, cuarentena, verificación binaria y ausencia de SDK de IA de pago obligatorio.
- CI #2644, run `33162578329`, terminó `SUCCESS` sobre `b5f5e084d82d998f7712b5e3abcb81bb3ee7aa1f`.

## Estado

- registro de autoridades: **operativo**
- cuarentena obligatoria de conocimiento no acreditado: **activa**
- identidad binaria para modelo oficial: **obligatoria**
- generación base sin API de IA de pago obligatoria: **verificada**
- validación humana material: **obligatoria**
- productionReady: **false**

LB100 puede considerarse cerrado para el objetivo de gobernanza del piloto. La futura producción institucional seguirá requiriendo revisión formal de vigencia y gobierno documental continuo.
