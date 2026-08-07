# COPILOT_RECOVERY_STATUS

## 1. Estado inicial

- Branch base inspeccionada: main
- Nueva rama de trabajo creada: feat/copilot/recovery-lb1
- package.json no existía en la raíz (se ha añadido uno mínimo para toolchain)
- tsconfig.json no existía en la raíz (se ha añadido uno mínimo)
- Documentos de conocimiento encontrados en `knowledge/` (README, VERSION.yaml, catalogo_expediente.yaml, subdirs)
- docs/ presenta 02_ROADMAP_V1.md, 03_ARCHITECTURE_DECISIONS.md, 04_CHANGELOG.md
- src/ estructura presente (application, bootstrap, documental, domain, engines, generators, infrastructure, knowledge, repositories, tools, ui, workflow)

## 2. Comandos planeados y su propósito

- npm ci: instalar dependencias declaradas en package.json
- npm run validate-knowledge: parsear YAML/JSON del directorio knowledge/
- npm run check-imports: detectar imports relativos que no resuelven a fichero
- npm run typecheck: ejecutar tsc --noEmit
- npm run build: compilar TypeScript a dist/
- npm test: ejecutar la suite (vitest)
- npm run smoke: secuencia validate-knowledge, check-imports, typecheck, build, test

## 3. Cambios realizados en esta tanda (commit único)
- chore(toolchain): add minimal package.json, tsconfig.json and basic validation scripts
  - package.json
  - tsconfig.json
  - scripts/validate-knowledge.js
  - scripts/check-imports.js
  - docs/audit/COPILOT_RECOVERY_STATUS.md (este archivo)

## 4. Evidencia de ejecución
- No se han ejecutado los scripts en el entorno de este agente. El siguiente paso (ejecución en CI o local) debe ser:

```bash
git checkout feat/copilot/recovery-lb1
npm ci
npm run validate-knowledge
npm run check-imports
npm run typecheck
npm run build
npm test
npm run smoke
```

Copias de salida y errores deberán pegarse en este issue o aquí para que proceda con correcciones adicionales.

## 5. Errores restantes (por confirmar tras ejecución local/CI)
- Posibles errores de parseo en knowledge/*.yaml y *.json
- Posibles imports relativos rotos en src/**/*.ts
- TypeScript diagnóstico en múltiples archivos (pendiente)
- Tests faltantes o rotos (pendiente)

## 6. Siguientes pasos propuestos
1. Ejecutar la secuencia de comandos listada en sección 4 en entrono local o CI (recomendado en CI que use la rama feat/copilot/recovery-lb1).
2. Pegar aquí las salidas; identificar errores y clasificarlos en knowledge / syntax / imports / tests.
3. Aplicar correcciones con commits pequeños y trazables: fix(knowledge):..., fix(domain):..., fix(imports):...
4. Re-ejecutar la secuencia hasta alcanzar LB-1.

## 7. Notas de cumplimiento
- No se ha modificado ninguna regla jurídica ni archivos en knowledge/ excepto para lectura.
- Todas las modificaciones se han hecho en la rama `feat/copilot/recovery-lb1`.

