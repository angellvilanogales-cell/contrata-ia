# ADR-0006 — Composición documental administrativa configurable

**Estado:** Aceptada en LB-5  
**Ámbito inicial:** contratos de servicios de limpieza de edificios/oficinas de una Administración Pública de la Junta de Andalucía.

## Contexto

La documentación preparatoria de un expediente no debe modelarse como una lista rígida de ficheros. Un mismo contenido jurídico puede materializarse de forma distinta según el modelo administrativo y el criterio de la unidad proponente o tramitadora.

El caso más relevante es la necesidad e idoneidad: debe quedar motivada en la documentación preparatoria conforme a los artículos 28 y 116 LCSP, pero puede formar un epígrafe de la Memoria Justificativa o presentarse como informe autónomo. En la documentación operativa SAE aportada al proyecto, la Memoria aparece compuesta por informe de necesidad, insuficiencia de medios para servicios y, en su caso, justificación de no división en lotes. Los PCAP aportados remiten asimismo a la memoria obrante en el expediente para las necesidades administrativas.

## Decisión

1. La unidad básica del motor documental es el **bloque jurídico-documental**, no el fichero.
2. `MEMORIA_JUSTIFICATIVA`, `PCAP` y `PPT` constituyen el núcleo documental ordinario de LB-5.
3. `NEED_IDONEITY` y `INSUFFICIENCY_MEANS` admiten al menos dos ubicaciones: `IN_MEMORY` y `STANDALONE`.
4. Una ubicación integrada excluye por defecto la generación duplicada del informe autónomo.
5. Todos los documentos se componen desde el mismo `LB5DocumentContext` y las mismas decisiones normativas para impedir divergencias de objeto, CPV, valor estimado, procedimiento, lotes, solvencia, garantías y demás datos comunes.
6. Los documentos adicionales solicitados por la persona tramitadora se generan mediante selección/reutilización de bloques verificados. Una instrucción vaga que no permita identificar bloques jurídicos verificables debe rechazarse en vez de producir texto administrativo inventado.
7. Cada párrafo derivado de una decisión jurídica conserva fuentes y estado de validación.
8. La salida editable principal es DOCX OOXML; el PDF es una representación secundaria. El formato administrativo de referencia es A4 y la familia principal del perfil inicial es Source Sans Pro, identificada como predominante en los PCAP, memorias y PPT aportados.
9. El PCAP generado por LB-5 es un proyecto que debe contrastarse, antes de aprobación, con el modelo recomendado vigente de la Comisión Consultiva de Contratación Pública de Andalucía correspondiente al procedimiento y fuente de financiación aplicables.

## Consecuencias

- El usuario puede decidir si el Informe de Necesidad queda integrado en Memoria o separado sin duplicar datos.
- La misma regla se aplica a insuficiencia de medios y puede extenderse a lotes, procedimiento, criterios, costes u otros informes justificativos.
- Un cambio de un dato del expediente se propaga a todos los documentos al recomponer el paquete.
- LB-6 podrá exponer esta decisión mediante una interfaz sencilla sin modificar la arquitectura jurídica.
- La generación no equivale a aprobación: los contenidos marcados `PENDING_HUMAN_VALIDATION` permanecen como propuestas de trabajo.

## Fuentes de diseño

- Ley 9/2017, artículos 28, 116, 122 y 124.
- Modelos de PCAP de servicios recomendados por la Comisión Consultiva de Contratación Pública de Andalucía y su control de actualizaciones publicado en diciembre de 2025.
- PCAP, memorias y PPT aportados al proyecto.
- Guía Operativa de Tramitación de Expedientes de Contratación del SAE aportada al proyecto.
