# LB105 · Normalización visual y ruta hacia un producto viable

## Regla documental

El PCAP mantiene el ODT oficial aplicable: no se sustituyen estilos, logos, cabeceras, pies ni cláusulas generales. Solo se cumplimentan destinos variables previamente reconocidos y auditados.

Memoria y PPT emplean el canon estructural LB104 y el perfil visual derivado `LB105-VISUAL-PROFILE-V1`. El perfil se ha contrastado con los documentos de VEIASA Windows Server, mobiliario de Cádiz, Panda Antivirus, Aulas Digitales y Tablets con plataforma. El corpus presenta tipografías y verdes diferentes; por ello el perfil estabiliza la función visual y no copia un expediente individual.

## Perfil físico de Memoria y PPT

- Página A4; márgenes superior e inferior de 1,8 cm y laterales de 2 cm.
- Source Sans Pro: título 14 pt, epígrafe principal 12 pt, subepígrafe 11 pt, cuerpo 10 pt, tablas 9 pt y pie 8 pt.
- Cuerpo negro, justificado, interlineado 115 % y separación posterior de 0,18 cm.
- Títulos y epígrafes principales en negrita y verde `#168253`; subepígrafes en negrita negra.
- Tablas sobrias, cabecera repetida, filas no partidas y cabecera con fondo `#E8F3EE`.
- Logotipo institucional validado en cabecera, con proporción conservada. Logos de financiación solo cuando esa financiación esté declarada y el activo gráfico haya sido validado.
- Pie con identificador de expediente, numeración automática y aviso de revisión humana.

El perfil es propio de Contrata-IA y no se presenta como manual corporativo oficial. La identidad del organismo y los logos no se infieren desde un expediente de ejemplo.

## Puertas acumulativas

| Puerta | Evidencia de cierre | Estado al iniciar LB105 |
|---|---|---|
| 1. Fuentes y autoridad | Normativa, modelos oficiales y precedentes identificados por tipo | Inventario disponible; no acredita revisión jurídica íntegra |
| 2. Expediente estructurado | Datos declarados, validados, persistidos y sellados | Cerrada para Supply ASA autofinanciado |
| 3. Selección del PCAP | Modelo oficial compatible y SHA comprobado | Cerrada para Supply ASA autofinanciado |
| 4. Canon de Memoria/PPT | Epígrafes comunes y especiales exactos | Cerrada en LB104 V1 |
| 5. Perfil visual | Reglas y auditor ODT de tipografía, alineación, color, página, logo y pie | Aplicación determinista y puerta automática cerradas para Supply; revisión visual del render real pendiente |
| 6. Plantillas físicas | Nuevos ODT conformes, versionados, persistidos y sin contaminación | Transición activa sobre activos LB94 autenticados; promoción binaria independiente pendiente |
| 7. Generación integral | Nuevo expediente produce PCAP, Memoria y PPT deterministas y auditados | Debe repetirse con las plantillas LB105 |
| 8. Asesoramiento | Preguntas aplicables, propuestas motivadas, conflictos visibles y trazabilidad hasta documentos | Parcial; completar por familia |
| 9. Piloto humano | Revisión nominativa, cero defectos críticos y aceptación motivada | Pendiente de las personas revisoras |
| 10. Operación institucional | Seguridad, respaldo, monitorización, soporte y gobierno de versiones | Pendiente; `productionReady=false` |

## Orden de ejecución

1. Migrar Memoria y PPT Supply a LB104 + LB105 y generar nuevos binarios ODT.
2. Validar visualmente PDF/PNG y técnicamente estructura, estilo, imágenes, placeholders y huellas.
3. Persistir los activos y activar ambas puertas en el generador autoritativo.
4. Repetir en Render el recorrido expediente nuevo → sellado → ZIP → apertura de los tres documentos.
5. Completar la aceptación humana de Supply y congelar esa versión piloto.
6. Repetir la misma secuencia para Service; después Works, Concession y Mixed.
7. Solo entonces evaluar `productionReady=true` mediante una decisión humana distinta de los autodiagnósticos técnicos.

## Alcance real del control LB105

El auditor inicial comprueba las declaraciones de estilos, interlineado y separación del cuerpo, dimensiones de página, correspondencia de referencias a imágenes embebidas no vacías y numeración dentro del pie. Su resultado no acredita todavía que todos los párrafos usen esos estilos, que no existan sobrescrituras ni que la imagen corresponda al organismo correcto. Tampoco certifica tablas, proporciones, disponibilidad de fuentes ni composición visual final. `requiresVisualReview=true` se mantiene incluso cuando estas comprobaciones pasan.

Antes de activar el perfil deben cerrarse: trazabilidad de cada propiedad hasta archivo y página fuente; identidad y SHA del logotipo autorizado; resolución efectiva de estilos y fuentes; tablas y saltos de página; pie completo; renderizado y revisión visual. Los tamaños, márgenes y colores anteriores constituyen un perfil de trabajo derivado, pendiente de contraste visual de los nuevos binarios, no una exigencia normativa.

## Transición física Supply

`LB105-SUPPLY-CANONICAL-ODT-V1` verifica primero la identidad, SHA, naturaleza y procedencia del activo persistido LB94. Después sustituye de forma determinista el cuerpo de Memoria o PPT por el canon LB104, incorpora los estilos LB105 y normaliza página y pie. El generador autoritativo vuelve a auditar estructura y perfil visual sobre cada ODT ya cumplimentado antes de incluirlo en el ZIP.

Esta transición permite probar el recorrido real sin declarar todavía una promoción binaria. La nueva versión persistida solo podrá registrarse cuando sus bytes reales se hayan renderizado, revisado visualmente y fijado mediante SHA-256. Hasta entonces se mantienen `requiresVisualReview=true`, `humanAcceptanceRequired=true` y `productionReady=false`.
