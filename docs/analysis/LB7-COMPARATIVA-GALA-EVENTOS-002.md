# LB-7 — Comparativa Gala y eventos provinciales

## Corpus

Se incorporan dos ternas completas aportadas por el usuario:

1. **ADM/2025/0008 (CONTR/2025/374417)** — I Gala de entrega de los Premios al Trabajo Autónomo en Andalucía.
   - Memoria justificativa.
   - PCAP de servicios por procedimiento abierto simplificado abreviado.
   - PPT.
   - Dos lotes: organización del evento y catering reservado a empresas de inserción.

2. **CONTR 2026 112626** — Organización de quince eventos provinciales en materia de emprendimiento.
   - Memoria justificativa.
   - PCAP de servicios por procedimiento abierto simplificado abreviado.
   - PPT.
   - Ocho lotes y múltiples localidades/NUTS.

## Hallazgos documentales

### Memoria

Los dos expedientes confirman que la Memoria de servicios de eventos debe poder componer, de forma independiente y condicional:

- competencia y finalidad pública;
- objeto y antecedentes;
- necesidad e insuficiencia de medios;
- división en lotes y, en su caso, reserva social de lote;
- CPV por lote o prestación;
- lugares y calendario;
- presupuesto y valor estimado;
- procedimiento;
- criterios de adjudicación;
- obligaciones sociales/ambientales cuando procedan.

La Gala muestra una necesidad fuertemente vinculada a un acto institucional y separa dos prestaciones funcionalmente diferenciadas. El expediente provincial muestra una estructura escalable a numerosos lotes, sedes y eventos con especificación diferenciada.

### PCAP

Ambos expedientes refuerzan la estrategia de Contrata-IA de seleccionar el modelo recomendado oficial por tipo de contrato/procedimiento/versión y concentrar la parametrización del caso en el Anexo I. Los dos PCAP consignan referencia al modelo recomendado e informe jurídico de sus anexos.

Debe soportarse:

- uno o varios CPV;
- lotes ordinarios y lotes reservados;
- NUTS y localidades múltiples;
- parametrización por lote;
- criterios automáticos en procedimiento simplificado abreviado;
- trazabilidad del informe jurídico de anexos como metadato interno, nunca como texto técnico del PPT.

### PPT

Los PPT confirman una familia técnica `EVENT_SERVICES` con bloques condicionales, no universales:

- definición de cada acto/evento;
- calendario y localidad;
- producción, escenografía, sonido, iluminación e imagen;
- streaming y audiovisual;
- fotografía y vídeo;
- presentación y personal auxiliar;
- accesibilidad e interpretación de lengua de signos;
- catering;
- viaje y alojamiento;
- logística, montaje y desmontaje;
- entregables y memoria/informe final.

Los datos concretos de aforo, fechas, sedes, número de eventos, personal, catering, alojamientos, medios audiovisuales y frecuencias no pueden inferirse ni inventarse: deben provenir del expediente o de respuesta humana validada.

## Invariantes cruzados adicionales para EVENT_SERVICES

Además de objeto, CPV, lotes, importes, duración y procedimiento, deben comprobarse entre Memoria-PCAP-PPT:

- nombre oficial de cada evento;
- número de eventos;
- número e identidad de lotes;
- localidad/NUTS por lote;
- reserva social del lote cuando exista;
- catering incluido/separado;
- viaje y alojamiento incluido;
- streaming/audiovisual incluido;
- accesibilidad/lengua de signos;
- calendario contractual y fechas críticas.

## Política jurídica

Estos expedientes sirven como evidencia de estructura y práctica administrativa. La existencia de un texto en un pliego real no basta para promoverlo a regla jurídica general. Toda regla se contrasta con normativa vigente, modelo oficial aplicable y, cuando proceda, informe jurídico específico.
