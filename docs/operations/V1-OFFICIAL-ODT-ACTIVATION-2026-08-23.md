# Activación V1 — verificación física del ODT oficial de suministro ASA

Fecha de verificación: 2026-08-23.

## Fuente verificada

Modelo de Pliego de Cláusulas Administrativas Particulares recomendado por la Comisión Consultiva de Contratación Pública para la contratación de suministro mediante procedimiento abierto simplificado abreviado, presentación electrónica de ofertas.

El propio ODT declara que se implementa sobre el modelo recomendado en sesión de 16/12/2021, informado por la Asesoría Jurídica de la entonces Consejería de Hacienda y Financiación Europea el 15/12/2021 (AJ-CHFE 2021/186), y actualizado en diciembre de 2025 conforme a las conclusiones de la sesión de 17/12/2025.

SourceId: `jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt`.

## Identidad binaria

- media type: `application/vnd.oasis.opendocument.text`
- tamaño: `508759` bytes
- SHA-256: `45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc`
- huella de estilos Contrata-IA: `9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee`
- `mimetype` es la primera entrada del ZIP y está almacenada sin compresión, conforme al empaquetado ODF.

La huella de estilos se calcula con el mismo algoritmo del renderer LB23 sobre `styles.xml`, `office:automatic-styles` de `content.xml` y `settings.xml`.

## Binding físico

Se han contrastado sobre `content.xml` nueve bindings ya existentes en el perfil semántico LB22. Cada anclaje XML aparece exactamente una vez en el original y contiene exactamente una vez el `valueToken` que debe sustituirse.

El renderer ha sido reforzado para sustituir únicamente el `valueToken` interior, no el elemento XML completo. De este modo se conservan el `text:span`, el nombre de estilo y el resto de estructura del modelo.

Se verificó físicamente una edición de prueba de los nueve huecos y la huella de estilo antes y después permaneció idéntica.

## Límite de aceptación descubierto

Esta verificación cierra la identidad del original y los nueve bindings existentes, pero no autoriza todavía la release V1 completa.

El Anexo I oficial contiene más decisiones y huecos que los nueve actualmente representados por el perfil LB22: cabecera/expediente/localidad, división en lotes y alternativas condicionadas, presupuesto desglosado y anualidades, forma de tramitación, aptitud, parámetros de anormalidad, desempate, consecuencias de condiciones especiales, subcontratación, régimen de pago, seguros, modificaciones y otros apartados.

La comparación con el expediente real `CONTR/2026/240267` confirma además que el caso de ferretería es un suministro en función de necesidades, sin división en lotes, con duración inicial de 24 meses y prórroga máxima de 24 meses, y precio como criterio único. Por ello no sería correcto reutilizar el binding simple `LOTE 1` como si describiera fielmente ese caso.

La activación productiva debe ampliar los bindings y el dominio únicamente con equivalencias exactas y mantener bloqueo para cualquier apartado no cubierto. No se declarará `productionReady=true` mientras el documento final conserve huecos administrativos relevantes o requiera correcciones manuales silenciosas.
