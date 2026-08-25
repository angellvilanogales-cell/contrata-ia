# V1 — Primer caso real: CONTR/2026/240267

Fecha de contraste: 2026-08-23.

## Finalidad

Este documento registra la matriz de aceptación factual y jurídica del primer expediente real usado para cerrar la V1 de Contrata-IA. No declara por sí mismo `productionReady=true`: la aceptación productiva exige además generación física desde el runtime, comparación documental, validación humana y pruebas operativas externas.

## Fuentes de contraste

- PCAP V7 del expediente CONTR/2026/240267, suministro de materiales de ferretería del Servicio Andaluz de Empleo.
- Informe AJ-SAE 2026/16, de 29/07/2026.
- Modelo oficial editable ODT de suministro por procedimiento abierto simplificado abreviado, actualizado en diciembre de 2025 y cuyo manifiesto binario está registrado en `JuntaSupplyAsaOfficialActivation.ts`.

## Matriz de hechos que no pueden alterarse silenciosamente

| Hecho | Valor de aceptación |
|---|---|
| Tipo contractual | SUPPLY / suministro |
| Procedimiento | Abierto simplificado abreviado |
| CPV | 44316400-2 |
| División en lotes | No |
| Justificación de no división | Debe conservarse |
| Contrato en función de necesidades | Sí, DA 33.ª LCSP |
| Presupuesto máximo para toda la vigencia | 18.160,96 € sin IVA |
| Prórrogas incrementan automáticamente ese máximo | No |
| PBL duración inicial | 10.552,44 € sin IVA |
| IVA PBL inicial | 2.216,01 € |
| PBL inicial IVA incluido | 12.768,45 € |
| Valor estimado | 21.793,15 € sin IVA |
| Modificación prevista máxima | 20 % |
| Duración inicial | 24 meses |
| Prórrogas máximas acumuladas | 24 meses |
| Sistema de precio | Precios unitarios |
| Referencias del catálogo | 98 |
| Criterio de adjudicación | Precio, 100 %, fórmula |
| Motivación especial del criterio único | Obligatoria en el caso |
| Causa de modificación prevista admisible | Mayores necesidades reales respecto de las estimadas, DA 33.ª |
| Incorporación indeterminada de nuevos artículos sin precio unitario | No admisible como causa prevista del caso |

## Reglas de aceptación incorporadas al código

`FerreteriaRealCaseAcceptanceProfile.ts` bloquea cualquier candidato que cambie los hechos anteriores. También registra como advertencia la referencia aislada a “contrato de servicios” existente en AJ-SAE 2026/16: no se utiliza para reclasificar el contrato, pues el objeto, el PCAP y el modelo del expediente corresponden a suministro.

La corrección de lotes también se ha trasladado al mapeo físico: `divisionIntoLots=false` se renderiza en la decisión expresa `División en lotes: No`; Contrata-IA no rellena un `LOTE 1` ficticio.

## Estado de aceptación

### Superado

- Modelo ODT oficial identificado y bytes exactos verificados.
- SHA-256 y huella de estilo verificados.
- Renderer ODT edita valores sin reconstruir el documento ni alterar su huella de estilo.
- Paridad factual/jurídica del primer caso codificada con pruebas positivas y negativas.
- Corrección semántica de no división en lotes protegida por test.

### Todavía necesario para aceptar producción

- Completar los bindings físicos de todos los campos aplicables del Anexo I del primer caso, con lógica condicional; no es necesario automatizar huecos que sean realmente no aplicables, pero sí impedir que queden decisiones necesarias sin materializar.
- Proveer al runtime los bytes exactos del ODT oficial mediante un almacén de activos controlado y verificar su SHA-256 al cargar.
- Ejecutar el recorrido universal de producción completo con CONTR/2026/240267 y obtener un ODT real desde la aplicación, no desde el pipeline legacy.
- Comparar el documento generado con el PCAP V7 y revisar visualmente formato, tablas, numeración, cabeceras, pies y símbolos.
- Validación humana final del técnico del expediente.
- Verificar persistencia/reapertura, backup/restauración, despliegue HTTPS y recorrido real desde navegador.
- Desactivar la generación legacy para producción cuando el recorrido universal quede aceptado.
- Completar activos oficiales y aceptación equivalente para los demás documentos que formen parte obligatoria del alcance declarado de V1 (por ejemplo Memoria/PPT si se mantienen en dicho alcance).

## Regla de cierre

No se proclamará V1 productiva hasta que la puerta `UniversalV1ReleaseReadiness` reciba evidencias reales de aceptación y operaciones. Una CI verde acredita la ingeniería automatizada, pero no sustituye esas evidencias externas y humanas.
