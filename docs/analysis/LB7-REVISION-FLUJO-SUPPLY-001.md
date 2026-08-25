# LB7-REVISION-FLUJO-SUPPLY-001

## Objeto
Revisión del flujo guiado de Contrata-IA a partir de la primera prueba real con el expediente SAE CONTR/2026/240267 (suministro de materiales de ferretería), contrastado con la Memoria, PPT, PCAP y el informe jurídico AJ-SAE 2026/16.

## Hallazgo principal
El flujo LB6 actualmente no debe utilizarse para generar documentación de suministros porque el motor de salida deriva de `LB4CleaningServiceEngine` y, por tanto, puede trasladar patrones de servicios de limpieza a expedientes de suministro. La prueba real lo ha confirmado: tipificación como servicio, CPV de limpieza, solvencia/subrogación/horarios propios de servicios y condiciones especiales referidas a productos de limpieza.

## Decisión de seguridad jurídica
Hasta completar una familia de entrada/generación específica para suministros, el sistema no debe presentar como aptos para remisión administrativa documentos de suministro producidos por el flujo genérico LB6/LB5. La salida debe quedar bloqueada o claramente identificada como no soportada.

## Orden lógico revisado
1. Identificación del órgano y unidad promotora.
2. Necesidad administrativa y objeto material.
3. Clasificación contractual expresa (suministro/servicio/obra/mixto/etc.) antes de aplicar reglas de procedimiento.
4. Determinación de CPV coherente con el objeto.
5. Configuración económica: precios unitarios o precio global, PBL, IVA, valor estimado, modificaciones previstas y prórrogas.
6. Determinación, cuando proceda, de contrato en función de necesidades y aplicación de la DA 33ª LCSP.
7. Propuesta de procedimiento a partir de tipo contractual, valor estimado y demás presupuestos legales.
8. Solo después, preguntas sobre criterios de adjudicación compatibles con el procedimiento propuesto.
9. División en lotes y motivación.
10. Prescripciones técnicas propias del tipo contractual.
11. Condiciones de ejecución, responsable, recepción, garantía, pedidos/entregas y facturación.
12. Revisión prejurídica de coherencia y validación humana.
13. Generación documental usando la familia/modelo administrativo correspondiente.

## Reglas específicas derivadas de la prueba real de ferretería
- Tipo contractual: SUMINISTRO.
- CPV de referencia del expediente real: 44316400-2.
- Procedimiento previsto: abierto simplificado abreviado cuando concurran los requisitos del art. 159.6 LCSP.
- En 159.6 todos los criterios deben ser cuantificables mediante fórmulas; no procede preguntar de forma independiente un porcentaje de juicio de valor si ya se ha adoptado ese procedimiento. Una respuesta incompatible debe provocar reconsideración del procedimiento, no una combinación incoherente.
- La posibilidad de utilizar precio como único criterio debe revisarse separadamente conforme al art. 145.3.f LCSP. La prueba real contiene además una observación expresa del Letrado que exige motivación especial.
- En contrato en función de necesidades debe modelarse DA 33ª LCSP, presupuesto máximo y eventual modificación por necesidades reales superiores.
- No deben preguntarse insuficiencia de medios, subrogación, horarios de servicio o solvencia propia de servicios cuando no correspondan al suministro/procedimiento.
- Los códigos internos `REQUIRED`, `IN_MEMORY`, `STANDALONE`, etc. no deben mostrarse al usuario. Deben existir etiquetas administrativas en castellano.

## Próximo paso
Antes de implementar el nuevo cuestionario de suministros se validará con una persona tramitadora la secuencia mínima de preguntas mediante diálogo. Cada pregunta debe justificar su necesidad y qué documento/campo alimenta. Una vez validada la secuencia, se implementará como familia `SUPPLY`/subperfil de suministro sucesivo por precios unitarios y se añadirá una regresión contra LEGAL-REAL-001.
