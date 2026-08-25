# LB-7 · Matriz canónica de preguntas adaptativas

Estado: candidata a piloto, pendiente de validación humana y revalidación jurídica antes de uso administrativo real.

## 1. Corpus contrastado

La matriz se ha construido comparando la lógica del piloto con ejemplos y modelos del corpus del proyecto, entre ellos:

- PCAP y PPT de contratos de servicios de la Junta de Andalucía incluidos en `ilovepdf_merged 4 PCAP.pdf` y `ilovepdf_merged 4 PPT.pdf`.
- Expediente real de suministro de material de ferretería del SAE: PCAP, Memoria justificativa e informe de Asesoría Jurídica AJ-SAE 2026/16.
- Modelo/ejemplo de PCAP de obras mediante procedimiento abierto y documentación técnica de la terminación de las obras de la Fase I del Parque Deportivo de La Garza.
- Guía Operativa de Tramitación de Expedientes de Contratación del SAE.
- LCSP consolidada y umbrales 2026 publicados por Orden HAC/1517/2025.

La finalidad de esta matriz es impedir que una rama contractual herede preguntas propias de otra naturaleza contractual.

## 2. Espina dorsal común

Estas preguntas son comunes, pero su formulación debe adaptarse al tipo contractual inferido:

1. Necesidad y finalidad pública.
2. Alcance real de la prestación.
3. Calificación contractual propuesta por el sistema: servicios, suministros u obras.
4. Análisis de división en lotes y motivación de la propuesta.
5. CPV principal y complementarios, cuando exista evidencia suficiente.
6. Presupuesto/valor estimado, calculado con la estructura económica propia de cada tipo.
7. Procedimiento de adjudicación propuesto y restricciones derivadas del procedimiento.
8. Criterios de adjudicación: automáticos y, cuando legalmente proceda, criterios sometidos a juicio de valor.
9. Validación humana de cada decisión con fundamento normativo visible.

La aplicación no debe preguntar al usuario qué tipo de contrato desea. Debe inferirlo a partir de los hechos y pedir confirmación únicamente cuando la clasificación no sea segura.

## 3. Rama de servicios

### Preguntas indispensables iniciales

1. ¿Qué resultado o actividad debe prestar la empresa?
2. ¿Puede ejecutarse por lotes sin perjudicar la coordinación o continuidad?
3. ¿Dispone la Administración de medios propios suficientes?
4. ¿La empresa accederá o tratará datos personales?
5. ¿Cuál es el presupuesto inicial sin IVA?
6. ¿Cuál es la duración inicial?
7. ¿Qué prórrogas se prevén?
8. ¿Cómo se forma el precio?
   - resultado único;
   - servicio recurrente;
   - coste inicial más prestación recurrente.
9. Solo si existe coste inicial + recurrente: cuantificar cada componente.
10. ¿Existe alguna característica cualitativa imprescindible que no pueda medirse mediante fórmula?

### Ramas condicionales

- Servicios intensivos en personal: convenio, costes salariales, subrogación cuando proceda, medios personales mínimos.
- Servicios digitales/web: propiedad intelectual, contenidos, accesibilidad, alojamiento, ciberseguridad, tratamiento de datos, soporte y niveles de servicio.
- Servicios intelectuales: régimen específico de criterios y procedimiento.
- Servicios con ejecución por unidades: unidades, precios unitarios, límites y medición.
- Servicios con datos: encargo de tratamiento, ubicación de sistemas, confidencialidad y seguridad.

## 4. Rama de suministros

### Preguntas indispensables iniciales

1. ¿Qué familias de bienes o artículos deben adquirirse?
2. ¿Pueden separarse por lotes funcionales sin perjudicar la gestión y entrega?
3. ¿La adquisición se realizará mediante:
   - cantidades cerradas;
   - pedidos sucesivos según necesidades reales?
4. Relación de artículos mediante tabla importable compatible con Excel:
   - referencia;
   - denominación;
   - descripción técnica mínima;
   - unidad;
   - cantidad estimada;
   - precio unitario estimado sin IVA;
   - lote;
   - CPV.
5. ¿Cuál es el presupuesto máximo del periodo inicial sin IVA?
6. ¿Cuál es la duración inicial?
7. ¿Se prevén prórrogas?
8. Si existen prórrogas: importe máximo previsto para cada una. No se extrapola linealmente el presupuesto inicial.
9. ¿Hay instalación, configuración, puesta en funcionamiento o formación asociada al bien?
10. ¿Qué plazo y lugares de entrega se requieren?
11. ¿Qué garantía técnica requiere la naturaleza de los bienes?
12. ¿Existe alguna característica cualitativa imprescindible que no pueda medirse mediante fórmula?

### Ramas condicionales

- Suministros por necesidades/precios unitarios: presupuesto máximo limitativo, cantidades estimativas, control de consumo y régimen compatible con la DA 33 LCSP cuando proceda.
- Bienes duraderos: garantía, repuestos, mantenimiento, asistencia posventa.
- Bienes fungibles: caducidad, conservación, condiciones de entrega.
- Equipos TIC: instalación, interoperabilidad, seguridad, licencias y datos.
- Suministro con fabricación: especificaciones de fabricación y control de calidad.

## 5. Rama de obras

Los modelos de obras del corpus muestran una estructura claramente distinta de servicios y suministros: proyecto, dirección facultativa, actuaciones previas, seguridad y salud, replanteo, programa de trabajo, ensayos, señalización, certificaciones, recepción, garantía y liquidación.

### Preguntas indispensables iniciales

1. ¿Qué actuación material se va a ejecutar y sobre qué inmueble o infraestructura?
2. ¿El proyecto permite lotes funcionalmente autónomos o exige coordinación unitaria?
3. ¿Existe proyecto de obra?
   - aprobado;
   - borrador pendiente;
   - todavía debe redactarse.
4. ¿Está disponible el inmueble, terreno o espacio necesario para ejecutar la obra?
5. ¿Cuál es el presupuesto de la obra sin IVA conforme al proyecto/mediciones?
6. ¿Cuál es el plazo de ejecución previsto?
7. ¿El proyecto incorpora estudio de seguridad y salud o estudio básico?
8. ¿Puede proceder revisión de precios? Esta respuesta solo abre la comprobación del art. 103 LCSP y de la fórmula correspondiente; no la activa automáticamente.
9. ¿Existe alguna característica cualitativa imprescindible que no pueda medirse mediante fórmula?

### Ramas condicionales de obras

- Clasificación/solvencia del contratista según cuantía, grupo/subgrupo y categoría que proceda.
- Dirección facultativa y responsable del contrato.
- Acta de comprobación de replanteo e inicio.
- Programa de trabajo.
- Licencias y autorizaciones.
- Plan de seguridad y salud.
- Ensayos y control de calidad.
- Medios auxiliares y personal clave.
- Subcontratación y tareas críticas.
- Certificaciones y anualidades.
- Recepción, certificación final, garantía, vicios ocultos y liquidación.

## 6. Reglas de poda del cuestionario

- No preguntar por coste inicial y mantenimiento a un suministro ordinario.
- No preguntar por insuficiencia de medios como bloque obligatorio en suministros u obras.
- No preguntar por prórrogas ordinarias en obras como si fueran servicios recurrentes; el dato nuclear es el plazo de ejecución.
- No preguntar criterios de juicio de valor antes de conocer el procedimiento y sus límites.
- No pedir al usuario artículos uno a uno cuando una tabla importable sea más eficiente.
- No proyectar importes de prórrogas mediante división lineal si la estructura económica no lo justifica.
- No dar por terminada la espina dorsal si existe una inconsistencia económica o técnica pendiente.
- Cuando una respuesta pueda derivarse de un documento importado (proyecto de obra, tabla de artículos, memoria técnica), priorizar la extracción y validación frente a volver a preguntarla manualmente.

## 7. Referencias normativas nucleares

- LCSP arts. 13, 16, 17 y 18: delimitación de tipos contractuales y contratos mixtos.
- LCSP arts. 28, 99, 100, 101, 102, 116 y 117: necesidad, objeto, lotes, presupuesto, valor estimado y preparación.
- LCSP arts. 145, 146 y 159: criterios y procedimientos simplificados.
- LCSP art. 116.4.f): insuficiencia de medios en servicios cuando proceda.
- LCSP arts. 231 y siguientes: preparación y ejecución del contrato de obras.
- LCSP art. 103: revisión de precios.
- Orden HAC/1517/2025: umbrales aplicables desde 1 de enero de 2026.

Toda regla se mantiene con estado `CURRENT_LAW_REQUIRED` hasta la validación jurídica previa al cierre del expediente.
