# ADR-0002 — TOOLCHAIN Y ENTRYPOINT MÍNIMO

Fecha: 2026-08-07
Estado: Adoptado (provisional, LB-1)

Contexto
- El repositorio auditado carece de toolchain reproducible (no existe package.json ni tsconfig). Esto impide avanzar en la recuperación ordenada.

Decisión
- Añadir un toolchain mínimo que permita ejecutar: validate-knowledge, check-imports, typecheck, build, test y start (bootstrap mínimo).
- El cambio se limita a scripts, entrypoint mínimo y mocks para permitir arranque. No se modificará la lógica de negocio ni los activos de conocimiento.

Consecuencias
- Permite ejecutar las puertas de LB-1 y recolectar diagnósticos reproducibles.
- Todos los cambios serán documentados y se archivarán versiones originales de cualquier archivo que se retire.

Alternativas consideradas
- No realizar cambios y pedir al equipo que cree manualmente los archivos (rechazada por coste operativo).

Migración
- Los archivos añadidos se ubican en branch feature/lb1-toolchain y se abrirá PR para revisión.
