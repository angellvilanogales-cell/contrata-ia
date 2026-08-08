# LB-7 — Golden set documental 10 + 10 + 10

## 1. Finalidad

Este corpus fija una primera batería de **10 Memorias + 10 PCAP + 10 PPT** para comparar Contrata-IA con documentación administrativa real.

No convierte un documento histórico en fuente normativa. La prioridad de decisión es siempre:

1. normativa vigente;
2. modelo recomendado vigente de la Comisión Consultiva de Contratación Pública de Andalucía;
3. expediente real reciente comparable;
4. expediente histórico, exclusivamente para observar estructura, estilo y variantes de práctica.

## 2. Corpus

| ID | Expediente/publicación | Año | Ámbito | Estado de lectura |
|---|---|---:|---|---|
| GOLD-001 | ADM-2024-0004 / CONTR-2024-636510 — limpieza CARL | 2024 | limpieza | DEEP_READ |
| GOLD-002 | CONTR-2025-468715 — limpieza SAE Huelva | 2025 | limpieza | DEEP_READ |
| GOLD-003 | CONTR-2026-38892 — mantenimiento integral SAE Sevilla | 2026 | mantenimiento edificios | DEEP_READ |
| GOLD-004 | PdC 2020-0000082000 | 2020 | servicios | IDENTIFIED |
| GOLD-005 | PdC 2019-0000070769 | 2019 | servicios | IDENTIFIED |
| GOLD-006 | PdC 2021-0000093344 | 2021 | servicios | IDENTIFIED |
| GOLD-007 | PdC 2021-0000091030 | 2021 | servicios | IDENTIFIED |
| GOLD-008 | PdC 2020-0000073100 | 2020 | servicios | IDENTIFIED |
| GOLD-009 | PdC 2021-0000112115 | 2021 | servicios | IDENTIFIED |
| GOLD-010 | PdC 2021-0000090399 | 2021 | servicios | IDENTIFIED |

Los diez registros cuentan con Memoria, PCAP y PPT identificados. Los tres primeros han sido leídos en profundidad dentro de las fuentes aportadas al proyecto; los restantes forman la cola controlada para lectura de detalle y ampliación de patrones. `IDENTIFIED` no equivale a revisión jurídico-documental completa.

## 3. Primeros resultados comparativos

### 3.1 Memoria justificativa

La Memoria real es sustancialmente más rica que una plantilla de párrafos genéricos. Los expedientes leídos muestran como bloques recurrentes:

- identificación y objeto;
- antecedentes concretos de la necesidad;
- necesidad e idoneidad;
- insuficiencia de medios en servicios, integrada o autónoma;
- duración y prórrogas;
- división/no división en lotes y motivación;
- CPV;
- presupuesto base y valor estimado con metodología de cálculo;
- elección y justificación del procedimiento;
- solvencia y criterios de adjudicación cuando procede su motivación;
- condiciones de ejecución relevantes.

La necesidad debe estar ligada a hechos del órgano promotor: centros, situación contractual previa, funciones públicas, problemas a resolver y consecuencias de no contratar. Contrata-IA no debe completar esos hechos con prosa inventada.

En contratos intensivos en mano de obra, la Memoria puede incorporar convenio colectivo, costes salariales, Seguridad Social, absentismo, vacaciones, subrogación, superficies y horas de servicio. Estos elementos deben entrar como datos o evidencia, no como inferencias literarias.

### 3.2 PCAP

El patrón correcto no es redactar un PCAP libre desde cero. Para Junta de Andalucía, Contrata-IA debe seleccionar el **modelo recomendado oficial aplicable** por:

- tipo de contrato;
- procedimiento;
- financiación;
- versión vigente del modelo.

El contenido estable del modelo y el contenido variable del expediente deben quedar separados. En los PCAP analizados, el centro de parametrización es el **Anexo I / Características del contrato**, mientras que el cuerpo contiene régimen jurídico, adjudicación, ejecución, prerrogativas, recursos y anexos generales/específicos.

Por ello, el generador definitivo deberá comportarse como `modelo oficial + parametrización validada`, no como generador de cláusulas jurídicas genéricas.

### 3.3 PPT

El PPT real es predominantemente técnico. Los ejemplos de limpieza contienen descripción física de edificios, superficies, plantas, pavimentos, cristales y mobiliario; después establecen tareas y frecuencias, personal, horarios, uniformidad, materiales, consumibles, residuos, tratamientos específicos, control de calidad, prevención de riesgos, coordinación, ejecución y, cuando procede, subrogación.

Contrata-IA puede estructurar y redactar estos datos, pero **no debe inventar** superficies, sedes, frecuencias, horas, personal, maquinaria, consumos, datos de subrogación ni niveles técnicos de prestación. Si no se importan desde una ficha/documento o no los facilita la unidad promotora, deben quedar pendientes y provocar pregunta o advertencia.

## 4. Coherencia cruzada obligatoria

El mismo expediente debe compartir una única fuente de verdad. Como mínimo se compararán automáticamente entre Memoria, PCAP y PPT:

- número/ID de expediente;
- objeto;
- CPV;
- lotes;
- presupuesto base;
- valor estimado;
- duración y prórrogas;
- procedimiento;
- sedes/centros objeto de prestación;
- situación de subrogación.

Una divergencia en cualquiera de estos campos será defecto de coherencia antes de la generación final.

## 5. Política de salida administrativa

Los documentos visibles no contendrán IDs internos de fuentes, nombres de archivos de conocimiento ni estados técnicos de validación. La trazabilidad completa permanece en auditoría. En el documento administrativo solo se incorporará la norma y el artículo cuando constituyan fundamento jurídico pertinente.

## 6. Siguiente iteración

La batería 10+10+10 se seguirá enriqueciendo con cada Memoria/PCAP/PPT real aportado y con expedientes oficiales seleccionados. Los cambios de estructura solo pasarán al generador cuando sean recurrentes o jurídicamente necesarios; una singularidad de un expediente no se generalizará automáticamente.
