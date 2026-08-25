# Contrata-IA · espinas de preguntas por naturaleza contractual

## Objetivo

Este documento fija la arquitectura funcional del diálogo adaptativo. La regla es preguntar únicamente hechos que la unidad promotora pueda conocer o validar. La aplicación debe deducir la calificación jurídica, CPV, procedimiento, reglas de solvencia, garantías y documentación aplicable a partir de esos hechos y mostrar la motivación y la fuente.

La espina común es corta. Las ramas posteriores dependen de la naturaleza contractual y de las respuestas anteriores. Una pregunta no debe aparecer si una regla previa ya permite resolverla o si no resulta aplicable al contrato concreto.

## Espina común mínima

1. Necesidad y finalidad pública: qué se necesita contratar y para qué.
2. Alcance material: qué debe entregar, ejecutar o realizar la contratista y dónde.
3. Clasificación contractual propuesta por el sistema, con explicación y validación humana solo si existen dudas o prestaciones mixtas.
4. División en lotes: el sistema analiza la separabilidad a partir del objeto y pregunta únicamente el hecho técnico que falte; genera la motivación de división/no división para validación.
5. CPV principal y complementarios propuestos por el sistema; validación humana.
6. Presupuesto del periodo inicial, duración y prórrogas. El cálculo económico posterior depende del tipo contractual.
7. Procedimiento propuesto a partir del valor estimado y las restantes condiciones legales.
8. Criterios de adjudicación: primero compatibilidad con el procedimiento; después propuestas vinculadas al objeto y ponderaciones para validación.
9. Solvencia/clasificación, garantías, condiciones especiales, penalidades, modificación, cesión/subcontratación, seguros y protección de datos: solo se pregunta lo que no pueda deducirse y únicamente cuando resulte aplicable.
10. Revisión de coherencia antes de generar Memoria, PCAP, PPT y anexos.

## Rama SERVICIOS

### Hechos indispensables de objeto y ejecución

- Prestaciones y entregables concretos.
- Lugar/modalidad de prestación y destinatarios.
- Si existe una prestación principal y otras accesorias o recurrentes.
- Nivel de servicio, plazos parciales, hitos y forma de aceptación cuando sean relevantes.
- Si existe personal adscrito de forma estable y, si procede, información de subrogación.
- Si la contratista accederá a datos personales, sistemas, servidores o información confidencial.
- Si se generan contenidos, software, diseños, informes u otros resultados sobre los que sea necesario fijar propiedad intelectual/uso.
- Insuficiencia de medios propios: solo para servicios y con justificación real de la unidad promotora.

### Economía

- Presupuesto inicial sin IVA.
- Duración inicial y prórrogas.
- Si el servicio combina un coste inicial no recurrente con costes periódicos, separar ambos; si no existe esa estructura, no formular esa pregunta.
- Forma de precio: tanto alzado, precios unitarios, tarifas, hitos u otra estructura aplicable.
- Contraste de mercado/costes cuando la cifra aportada sea solo estimativa.

### Adjudicación y ejecución

- Si existe algún aspecto cualitativo imprescindible que no pueda medirse mediante fórmula; solo después de conocer el procedimiento candidato.
- Criterios objetivos vinculados al servicio y, si procede, criterios sometidos a juicio de valor con propuesta de ponderación para validación.
- Solvencia profesional/técnica y medios personales/materiales solo cuando sean exigibles.
- Protección de datos, confidencialidad, propiedad de los trabajos, subcontratación, seguros, penalidades y condiciones especiales únicamente si proceden.

### Caso de regresión: web EURES

El flujo validado debe conducir a: servicio; análisis de lote único por continuidad entre desarrollo y mantenimiento; CPV web; presupuesto/duración/prórrogas; separación desarrollo inicial/mantenimiento; valor estimado; procedimiento; compatibilidad de criterios; protección de datos, accesibilidad, seguridad y propiedad intelectual como ramas posteriores.

## Rama SUMINISTROS

### Hechos indispensables de objeto y artículos

- Familias de productos y destino del suministro.
- Relación detallada de artículos: vía principal mediante plantilla Excel/CSV importable.
- Para cada referencia: denominación, especificación técnica mínima, unidad, cantidad estimada, precio unitario estimado, lote y CPV cuando proceda.
- Modalidad: cantidades cerradas o suministro sucesivo mediante pedidos según necesidades.
- Lugares de entrega, plazo máximo de entrega y, cuando sea relevante, frecuencia/logística.
- Si se requieren muestras, equivalencias, homologaciones o requisitos técnicos especiales.

### Lotes

- Analizar familias funcionales, autonomía de suministro, logística, economías de escala y riesgo para la correcta ejecución.
- El sistema propone uno o varios lotes y redacta la motivación; la unidad promotora valida.

### Economía

- Precios unitarios obtenidos/contrastados con mercado.
- Cantidades estimadas cuando proceda, dejando claro si son orientativas.
- Presupuesto máximo limitador del periodo inicial cuando se trate de suministro sucesivo conforme a necesidades.
- Duración inicial y prórrogas.
- Importe máximo previsto de cada prórroga: no extrapolar automáticamente por simple división lineal.
- Valor estimado incluyendo prórrogas, opciones y modificaciones previstas que legalmente procedan.

### Ejecución

- Garantía/plazo de garantía según naturaleza de los bienes.
- Entrega, recepción y control de conformidad.
- Incrementos de unidades/modificaciones solo dentro de los supuestos legalmente configurados y con validación jurídica actual.
- Protección de datos/confidencialidad solo si el suministro implica acceso a información o sistemas.

### Caso de regresión: ferretería

El flujo debe identificar suministro sucesivo por precios unitarios, permitir importar la relación de artículos, distinguir cantidades estimadas de obligación de compra, analizar lote único/varios lotes, CPV 44316400-2 como propuesta de alta confianza, fijar presupuesto máximo, duración/prórrogas y valor estimado sin preguntar por costes de desarrollo o mantenimiento.

## Rama OBRAS

### Preparación técnica indispensable

- Qué obra se necesita ejecutar, finalidad, emplazamiento y alcance físico.
- Existencia y estado del proyecto: aprobado; pendiente de redacción; o contrato que incluya redacción de proyecto y ejecución, cuando legalmente proceda.
- Presupuesto del proyecto y plazo de ejecución.
- Disponibilidad de terrenos/inmueble y condiciones básicas para el replanteo.
- Si la obra afecta a estabilidad, seguridad o estanqueidad; dato necesario para determinar la exigencia de supervisión del proyecto cuando el presupuesto sea inferior al umbral general.
- Supervisión del proyecto cuando resulte preceptiva y replanteo previo a la aprobación del expediente.

### Lotes y CPV

- Analizar unidades funcionales de obra y posibilidad real de ejecución independiente.
- Proponer CPV de obra principal y, cuando proceda, complementarios por lotes.

### Economía y procedimiento

- Presupuesto base derivado del proyecto, valor estimado, IVA y anualidades.
- Revisión de precios solo cuando legalmente proceda.
- Procedimiento según valor estimado y condiciones del artículo 159 u otras reglas aplicables.
- Clasificación empresarial/solvencia conforme a la cuantía y naturaleza de la obra.

### Ejecución

- Plazo total, hitos/plazos parciales si existen.
- Dirección facultativa, responsable del contrato y coordinación de seguridad y salud cuando proceda.
- Penalidades por demora/incumplimientos específicos.
- Modificaciones previstas, subcontratación y condiciones especiales.
- Recepción, plazo de garantía y responsabilidades posteriores.

## Reglas de interfaz

- Nunca preguntar al usuario «qué tipo de contrato quiere» si la naturaleza puede deducirse de la necesidad.
- Nunca presentar preguntas de una rama de servicios en suministros u obras.
- Las preguntas jurídicas deben transformarse en preguntas de hechos comprensibles.
- Toda propuesta del sistema debe mostrar: decisión, explicación breve, fundamento normativo/modelo, estado de verificación de vigencia y botón validar/modificar.
- «No lo sé» debe ser una respuesta válida cuando el dato pueda contrastarse posteriormente; el sistema debe proponer cómo obtenerlo y marcarlo como pendiente, no inventarlo.
- Los datos derivados de hojas de artículos, proyectos o anexos deben reutilizarse en Memoria, PCAP y PPT para evitar volver a preguntar lo ya disponible.

## Fuentes de contraste

- Modelos vigentes de PCAP de la Comisión Consultiva de Contratación Pública de la Junta de Andalucía para obras, servicios y suministros.
- Pliegos y memorias reales incorporados al corpus del proyecto, especialmente servicios de mantenimiento y suministro de ferretería.
- LCSP: arts. 16, 17, 18, 28, 99, 100, 101, 116, 145, 146, 159; DA 33 para suministros/servicios en función de necesidades; y arts. 231 a 246 para obras, con especial atención a proyecto, supervisión y replanteo.
- Umbrales vigentes publicados por la Orden HAC/1517/2025 desde 1-1-2026.

## Estado

Arquitectura de preguntas validada como base funcional. La incorporación de una nueva rama contractual exige corpus/modelos suficientes, reglas normativas verificadas y pruebas de regresión antes de declarar generación documental completa para esa rama.
