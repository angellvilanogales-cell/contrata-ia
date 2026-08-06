# ADR-0001 — BASELINE OFICIAL DE CONTRATA-IA

**Fecha:** 2026-08-06  
**Estado:** Aprobado para la línea base  
**Baseline:** BASELINE-2026-08-06

## Contexto

La auditoría maestra identificó una base de código extensa pero no integrada como producto ejecutable. Se detectaron duplicidades funcionales, errores sintácticos, imports no resueltos, ausencia de configuración de build, ausencia de pruebas automatizadas y exportaciones provisionales.

## Decisión

Se fija como línea base técnica el ZIP:

`contrata-ia-main (20)(1).zip`

SHA-256:

`bfbc11511ea6745c5a977a4e578bf1fe9529167faeb9267af8332e945b4fd8e1`

El estado oficial se mide por hitos LB-0 a LB-7 y puertas de aceptación.

## Reglas

1. La baseline original no se modifica.
2. Toda copia de trabajo deriva de la baseline.
3. No se mide progreso por número de archivos.
4. Antes de crear componentes se buscan equivalentes existentes.
5. Debe existir una única implementación canónica por responsabilidad.
6. La compilación es una puerta obligatoria.
7. Las decisiones normativas deben ser trazables a fuentes.
8. La validación humana es obligatoria para decisiones con efecto administrativo.
9. Los formatos documentales deben ser reales.
10. Los cambios arquitectónicos se registran mediante ADR.

## Línea base funcional

- Cobertura de componentes redactados: 68 %
- Consolidación técnica e integración verificable: 31 %
- Avance funcional ponderado V1.0: 42 %
- Preparación para producción administrativa: 0 %

## Próxima puerta

LB-1 — Proyecto compilable.

Criterio:

`TYPECHECK = 0 errores`

`BUILD = 0 errores`

`TEST = OK`

`START = OK`
