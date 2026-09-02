import type {EvidenceField} from "../../../domain/expediente/EvidenceField";
import type {UniversalEvidenceRecord} from "../../intake/lb52/UniversalEvidenceWorkspace";

const source=(id:string)=>({kind:"PRIMARY_DOCUMENT" as const,sourceId:id});
function validated(key:string,value:unknown,sourceId:string):EvidenceField<unknown>{return{key,value,status:"HUMAN_VALIDATED",sources:[source(sourceId)],humanValidationRequired:true,humanValidated:true,diagnostics:["Snapshot congelado LB102 para reproducción del expediente real; no constituye valor general por defecto."]};}
function record(caseId:string,sourceId:string,values:Record<string,unknown>):UniversalEvidenceRecord{return{caseId,updatedAt:"2026-09-02T11:00:00.000Z",fields:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,validated(k,v,sourceId)]))};}

export const LB102_SUPPLY_PANDA=record("CONTR 2025 466864","REG-SUPPLY-002",{
 contractType:"SUPPLY",procedure:"ABIERTO_SIMPLIFICADO_ORDINARIO","economic.fundingSource":"AUTOFINANCED","technical.supplyVariant":"ICT_LICENSE_OR_SOFTWARE","technical.hasSuccessiveOrders":false,
 need:"Mantener la protección antimalware corporativa mediante renovación de licencias del producto Panda.",object:"Suministro de licencias de software de seguridad Panda y soporte asociado.",cpvMain:"48760000-3",
 "lots.divisionIntoLots":false,"lots.noDivisionJustification":"La prestación constituye una unidad funcional y técnica vinculada a una única solución de seguridad.",
 baseTenderBudgetCents:6119225,"economic.initialVatAmountCents":1285037,"economic.initialPblVatIncludedCents":7404262,"economic.legalEstimatedValueCents":6119225,
 "economic.estimatedValueCalculationMethod":"Valor estimado declarado en la fuente primaria, sin prórrogas ni modificaciones previstas.","economic.priceDeterminationRegime":"Precios unitarios por componentes/licencias.",
 durationMonths:36,extensionMonths:0,"execution.extensionStructure":"Sin prórroga declarada en la fuente primaria.",
 "criteria.economicSolvency":"Volumen anual de negocios conforme al PCAP del expediente.","criteria.technicalSolvency":"Experiencia y medios técnicos; se exige acreditación Partner Gold del fabricante conforme a la fuente.",
 "criteria.awardCriteria":["Oferta económica y demás criterios automáticos declarados en el expediente"],"execution.specialExecutionConditions":["Condiciones especiales de ejecución según PCAP del expediente"],
 "technical.executionLocations":["Servicios Centrales del Servicio Andaluz de Empleo"],"technical.technicalRequirements":"Renovación de la solución de seguridad, protección antimalware y funcionalidades técnicas definidas en el PPT.",
 "technical.licenseRequirements":"Derechos de uso de las licencias durante 36 meses; compatibilidad y continuidad con la solución instalada; requisito Partner Gold acreditado.","technical.supportRequirements":"Mantenimiento, actualizaciones y soporte durante toda la vigencia contractual según PPT.",
 "execution.receiptAndAcceptanceRegime":"Conformidad previa comprobación de licencias, activación y soporte contratado."
});

export const LB102_SUPPLY_FERRETERIA=record("CONTR/2026/240267","REG-SUPPLY-001-POST-INTERVENCION",{
 contractType:"SUPPLY",procedure:"ABIERTO_SIMPLIFICADO_ABREVIADO","economic.fundingSource":"AUTOFINANCED","processing.processingType":"ORDINARIA","administrative.contractingAuthority":"Servicio Andaluz de Empleo","administrative.reservedContractDa4":false,
 need:"Suministro de materiales y artículos de ferretería para pequeñas reparaciones y reposiciones en los edificios del Servicio Andaluz de Empleo.",object:"Suministro de materiales y artículos de ferretería para pequeñas reparaciones y reposiciones en los edificios del Servicio Andaluz de Empleo.",cpvMain:"44316400-2",
 "technical.supplyVariant":"SUCCESSIVE_NEEDS_CATALOG","technical.hasSuccessiveOrders":true,"technical.hasServicePlatformComponent":false,"technical.hasInstallationOrAssembly":false,
 "technical.executionLocations":["Instalaciones de los Servicios Centrales del Servicio Andaluz de Empleo y sus oficinas anexas en Sevilla"],"technical.technicalRequirements":"Catálogo cerrado de referencias de ferretería; cantidades estimativas variables según necesidades reales; productos de primera calidad; no pueden incorporarse artículos nuevos por la modificación prevista.",
 "lots.divisionIntoLots":false,"lots.noDivisionJustification":"La prestación se configura como una unidad funcional de suministro de ferretería para la gestión coordinada de las necesidades de los centros destinatarios.",
 baseTenderBudgetCents:1055244,"economic.initialVatAmountCents":221601,"economic.initialPblVatIncludedCents":1276845,"economic.legalEstimatedValueCents":2532586,
 "economic.needsBasedContractDa33":true,"economic.budgetCoversEntireContractLife":false,"economic.estimatedValueCalculationMethod":"Valor estimado validado post-Intervención: 25.325,86 € sin IVA = 10.552,44 € de importe inicial + 2.110,49 € de modificación prevista del 20 % + 12.662,93 € correspondientes a la prórroga máxima de 24 meses incluyendo su 20 % de modificación.","economic.priceDeterminationRegime":"Precios unitarios por referencia del catálogo validado.","economic.priceRevisionRegime":"No procede.",
 "economic.annualityBudgetRows":[{year:2026,amountCents:159606,budgetApplication:"1439010000 G/32L/22000/00 01",vatIncluded:true},{year:2027,amountCents:638423,budgetApplication:"1439010000 G/32L/22000/00 01",vatIncluded:true},{year:2028,amountCents:478816,budgetApplication:"1439010000 G/32L/22000/00 01",vatIncluded:true}],
 durationMonths:24,extensionMonths:24,"execution.extensionStructure":"Una o varias prórrogas con una duración máxima conjunta de 24 meses.","execution.extensionNoticeMonths":2,
 "execution.plannedModificationRegime":"ART204_UP_TO_20_PERCENT:INCREASE_CONSUMPTION_EXISTING_REFERENCES:NO_NEW_ARTICLES","execution.specialExecutionConditions":["Cumplimiento de las condiciones especiales de ejecución declaradas en el PCAP del expediente."],"execution.receiptAndAcceptanceRegime":"Entrega conforme a las necesidades del SAE y recepción previa comprobación de conformidad; plazo ordinario de entrega de 5 días hábiles y sustitución de material defectuoso en 3 días hábiles.",
 "criteria.awardCriteria":[{nombre:"Precio",ponderacion:100,evaluableMedianteFormula:true}],"criteria.singleCriterionMotivation":"La prestación está suficientemente definida mediante un catálogo cerrado y prescripciones técnicas, permitiendo adjudicar mediante precio como único criterio, 100 puntos.",
 "review.interventionAnnuality2026ValidatedCents":159606,"review.interventionEstimatedValueValidatedCents":2532586,"review.interventionValidationDate":"2026-09-02"
});
