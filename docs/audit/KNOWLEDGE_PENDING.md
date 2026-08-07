# Conocimiento pendiente de validación

## Incoherencia detectada

`knowledge/rules/procedimiento.rules.yaml` declara el identificador `solvencia` y contiene reglas de solvencia, pese a que la ruta y el nombre del archivo indican que debería contener conocimiento de procedimiento.

## Tratamiento

- No se ha reinterpretado el contenido como reglas de procedimiento.
- No se ha inventado ni sustituido conocimiento jurídico.
- La incoherencia queda detectada por `npm run audit:knowledge:integrity`.
- El fichero debe contrastarse con la fuente canónica del proyecto antes de consolidarlo.

**Estado: PENDIENTE DE VALIDACIÓN / FUENTE.**
