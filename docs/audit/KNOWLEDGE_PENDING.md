# Conocimiento pendiente de validación

## 1. Incoherencia de archivo YAML

`knowledge/rules/procedimiento.rules.yaml` declara el identificador `solvencia` y contiene reglas de solvencia, pese a que la ruta y el nombre del archivo indican que debería contener conocimiento de procedimiento.

Tratamiento:

- No se ha reinterpretado el contenido como reglas de procedimiento.
- No se ha inventado ni sustituido conocimiento jurídico.
- La incoherencia queda detectada por `npm run audit:knowledge:integrity`.
- El fichero debe contrastarse con la fuente canónica del proyecto antes de consolidarlo.

## 2. Reglas de procedimiento todavía provisionales

La implementación canónica localizada en `src/domain/knowledge/rules/ProcedureRules.ts` declara expresamente que sus umbrales económicos definitivos de la LCSP todavía no están implementados y que su estructura debe completarse con conocimiento extraído de las fuentes.

Por tanto, esta fase no convierte esas reglas provisionales en decisiones jurídicas definitivas ni las sustituye por reglas inventadas.

**Estado global: PENDIENTE DE VALIDACIÓN / FUENTE.**
