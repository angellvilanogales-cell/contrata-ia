# Catálogo CPV utilizado por Contrata-IA

- Fuente incorporada: `listado-cpv.ods`, hoja `Clasificador`, facilitada en el corpus del proyecto `repo normativo y ejemplos.zip`.
- Registros válidos importados: 9.454 códigos con patrón CPV `00000000-0` y su denominación. El corpus completo se distribuye en partes mecánicas bajo `parts/`; `cpv.json` conserva la compatibilidad con el catálogo previo y el cargador elimina duplicados por código.
- Transformación: se conservan literalmente código y epígrafe; las palabras clave se derivan mecánicamente del epígrafe para la búsqueda local.
- Uso: el resultado es una lista ordenada de candidatos. La primera coincidencia nunca se promueve automáticamente como CPV principal.
- Autoridad jurídica mostrada al usuario: Reglamento (CE) n.º 2195/2002, modificado por el Reglamento (CE) n.º 213/2008, enlazado a EUR-Lex.

La selección definitiva del CPV requiere validación humana y debe contrastarse con el objeto completo y, cuando existan, con los lotes.
