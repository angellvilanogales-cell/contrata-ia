# LB96 · Cierre físico del vertical Service

Fecha de cierre técnico: 27/08/2026.

## Resultado

LB96 queda cerrado a nivel de ingeniería con un paquete físico Service compuesto por Memoria + PCAP + PPT, persistencia durable, gate de identidad física, generación editable, auditoría cruzada y validación humana obligatoria.

`engineeringClosed=true` no implica `productionReady=true`. La preparación institucional continúa en LB101-LB103.

## Autoridad documental

La Comisión Consultiva de Contratación Pública de la Junta de Andalucía mantiene publicados modelos recomendados con presentación electrónica. En el portal oficial figura, para contratos de servicios autofinanciados, el modelo "PCAP Servicios, procedimiento abierto" en ODT, junto a sus variantes de abierto simplificado ordinario, abierto simplificado abreviado y procedimientos con negociación.

Fuente oficial de catálogo:
https://www.juntadeandalucia.es/organismos/economiahaciendafondoseuropeos/areas/contratacion/consultiva/paginas/modelos-pliegos.html

Modelo Service abierto/autofinanciado identificado en el portal:
https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_servicios_abierto_autofinanciada.odt

El portal declara control de actualización de los modelos en diciembre de 2025. La estructura se ha contrastado además con el corpus Service real 2024-2026, incluido mantenimiento SAE Sevilla.

## Regla de procedencia

Contrata-IA NO declara como oficial el PCAP físico que genera en LB96. El activo de runtime es una plantilla general derivada y trazada al modelo recomendado vigente y al corpus Service real. Se mantiene:

- `provenance=CONTRATA_IA_DERIVED_GENERAL_TEMPLATE`
- `officialModel=false`
- `humanValidationRequired=true`

La fuente oficial actúa como autoridad estructural y jurídica dentro de su ámbito, pero no se suplanta ni se altera su identidad.

## Activos físicos LB96

### Memoria Service V2
- ID: `contrata-ia:service:memory:general:LB96-SERVICE-GENERAL-ODT-V2`
- SHA-256: `a35dae9200d9f55ed55265383a49ca2c0683509bec9ec34e6af337fdcf494096`
- Editable ODT.
- Derivada Contrata-IA.

### PPT Service V2
- ID: `contrata-ia:service:ppt:general:LB96-SERVICE-GENERAL-ODT-V2`
- SHA-256: `87a823c9a765469ee0b851e01e494b7b9f4f5a0bc4e4ffd66bc442720eae3217`
- Editable ODT.
- Derivada Contrata-IA.

### PCAP Service V2
- ID: `contrata-ia:service:pcap:general:LB96-SERVICE-PCAP-DERIVED-ODT-V2`
- SHA-256: `7a3021f5e8665202b78e49060456a644a472421d1176a58ba4038b5af8148248`
- Huella de estilo: `sha256:21f3ff8b627be04a347ae63da7681519d143d878d0cc8c2c538cc51b26b02274`
- 3.349 bytes.
- 28 slots jurídicos/documentales controlados.
- Derivada Contrata-IA; no oficial.

La identidad del PCAP V2 fue verificada nuevamente sobre los bytes decodificados en el almacén durable: SHA calculado = SHA declarado. La carga V1 defectuosa fue eliminada del inventario.

## Salvaguardas

1. No se usa PCAP Supply como PCAP Service.
2. Las decisiones no acreditadas no se completan por similitud con otro expediente.
3. Lotes, solvencia, garantías, subrogación, protección de datos, criterios, modificaciones y demás decisiones jurídicas quedan bloqueadas o marcadas para decisión humana cuando falte evidencia.
4. La información de subrogación solo se materializa cuando existe obligación acreditada conforme al régimen aplicable y art. 130 LCSP.
5. La insuficiencia de medios propios se trata expresamente cuando proceda conforme al art. 116.4.f LCSP.
6. La generación física se produce desde el expediente universal y mantiene auditoría cruzada entre Memoria, PCAP y PPT.

## Verificación técnica

- Persistencia durable de los tres activos Service: acreditada.
- PCAP V2: longitud física y SHA-256 recalculados en persistencia.
- Inventario Service separado de Supply.
- TypeScript/build/auditorías: superados.
- CI de cierre: Contrata-IA CI #2441, `success`, HEAD `dc2eb0201b03d934b4cde24e8adaf0bf44f38708`.

## Estado de cierre

- `physicalPackageOperational=true`
- `engineeringClosed=true`
- `humanValidationRequired=true`
- `productionReady=false`

Siguiente bloque: **LB97 — Vertical Works físico operativo**.
