# LB98 — Vertical Concession físico operativo · estado

## Alcance

LB98 se implementa por subtipo. No se utiliza un PCAP de servicios ni un PCAP de obras ordinario para una concesión distinta de su naturaleza jurídica.

## Autoridad documental y normativa

- LCSP: arts. 14.4 y 15 para la transferencia del riesgo operacional; arts. 247-250 para preparación de concesión de obras; art. 285.2 para estudio de viabilidad en concesión de servicios, además del resto del régimen concesional aplicable.
- No se ha localizado en el catálogo vigente de modelos recomendados de la Junta una familia general de PCAP de concesiones comparable a Supply, Service o Works.
- Caso real SERVICE_CONCESSION: concesión de cafetería y máquinas expendedoras del Hospital Universitario de Puerto Real, con PCAP, PPT, memoria y estudio de viabilidad. Se usa como autoridad de contraste/regresión y nunca como plantilla general.
- Caso real WORKS_CONCESSION: aparcamientos del nuevo Hospital de Málaga, con estudio de viabilidad aprobado y documentación de proyecto. Se usa como autoridad de preparación y nunca como plantilla general.

## SERVICE_CONCESSION — perfil físico V1

Se dispone de cuatro activos derivados Contrata-IA, todos `officialModel=false` y `humanValidationRequired=true`:

1. PCAP `contrata-ia:concession:pcap:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `76d6a9999bf77064c8a655feaaf54f9178df3066eac2d4583188b1b56d3c7a8f`
2. Memoria `contrata-ia:concession:memory:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `d64b5e6923d23d5b5824bb527e1222ec31cbcac001e09c438dab019b5ab53b90`
3. PPT `contrata-ia:concession:ppt:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `2786a0d0d584dcb4e1349be679ac2c314e38cd02abe06814ef22cb727fbe0ce2`
4. Estudio de viabilidad `contrata-ia:concession:viability:service:LB98-CONCESSION-GENERAL-ODT-V1`
   - SHA-256 `60bccd4c427b6da3a8317a9b8fa4ef6eb9af2b0f8c3c0060f0dcba6a20f9b035`

Los cuatro binarios están persistidos en Supabase. La longitud decodificada y el SHA calculado desde PostgreSQL coinciden con los metadatos declarados.

La tabla de activos admite desde LB98 el tipo `VIABILITY`. La Edge Function `contrata-ia-persistence` está desplegada en versión 6 y permite `VIABILITY` manteniendo su autenticación por token, límites de tamaño y verificación SHA.

## Gates Service Concession

- `ConcessionRiskOperationalGate`: no confunde riesgo y ventura ordinario con riesgo operacional; exige riesgo de demanda/suministro, exposición real al mercado, pérdida potencial no nominal y ausencia de recuperación garantizada incompatible.
- `ConcessionViabilityContentGate`: demanda, inversión/financiación, costes/ingresos, VAN/tasa de descuento, matriz de riesgos y ayudas de Estado.
- `ConcessionGeneralTemplatePhysicalGate`: SHA, ODT, estilo, slots y procedencia.
- `ConcessionGeneralEditableTemplateRenderer`: no infiere decisiones pendientes.
- `ConcessionUserDocumentPackageGenerator`: PCAP + Memoria + PPT + Estudio de Viabilidad + manifest.json.
- Auditoría cruzada: objeto, CPV, VE, matriz de riesgo y VAN.
- `ConcessionUserJourneyCoordinator`: revisión humana obligatoria antes de documentos.
- `/concession` y API LB98 están integrados en el runtime piloto.

## Evidencia de ingeniería Service Concession

El E2E `lb98-concession-package-e2e.test.ts` utiliza exactamente los mismos cuatro binarios físicos persistidos y un expediente sintético expresamente identificado como regresión. Genera las cuatro piezas y el ZIP, y prueba riesgo operacional, viabilidad y auditoría cruzada.

CI #2548 (`33122567436`) finalizó `SUCCESS` tras aislar el nuevo tipo `VIABILITY` del provisionador histórico Supply.

Resultado del perfil SERVICE_CONCESSION V1:

- physical profile operational: **true**
- human validation required: **true**
- production ready: **false**

## WORKS_CONCESSION — overlay seguro

`WorksConcessionPreparationGate` incorpora:

- estudio de viabilidad art. 247;
- decisión expresa sobre anteproyecto art. 248;
- proyecto, supervisión, aprobación y replanteo por la vía del art. 249 cuando la Administración define íntegramente las obras;
- resolución expresa de la aplicabilidad del informe de evaluación financiera;
- reutilización exclusiva de gates técnicos LB97, sin reutilizar su PCAP ordinario como PCAP concesional.

El caso Málaga acredita viabilidad/proyecto como fuente real, pero no autoriza a promover un PCAP/PPT general de concesión de obras.

Estado Works Concession:

- autoridad real: **sí**
- gates jurídicos de preparación: **implementados**
- perfil físico específico PCAP/Memoria/PPT/Viabilidad: **pendiente**
- generación documental Works Concession: **bloqueada de forma segura**

## Estado LB98 global

LB98 ya supera el objetivo material para SERVICE_CONCESSION: caso real, riesgo operacional, viabilidad, paquete físico y E2E. El subtipo WORKS_CONCESSION está source-backed y jurídicamente protegido, pero no dispone aún de perfil físico específico. Por ello no debe afirmarse cobertura física universal de todas las concesiones.

- SERVICE_CONCESSION engineering profile: **closed/operational**
- WORKS_CONCESSION physical profile: **pending**
- canonical CONCESSION universal coverage: **partial/source-backed**
- `productionReady`: **false**
- `humanValidationRequired`: **true**
