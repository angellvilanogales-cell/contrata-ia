import { createHash } from "node:crypto";
import { CanonicalExpedienteState } from "../../../domain/expediente/CanonicalExpedienteState";
import { CriterioAdjudicacion } from "../../../domain/expediente/CriterioAdjudicacion";
import { EstadoExpediente } from "../../../domain/expediente/EstadoExpediente";
import { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { renderSupplyAsaProtectedPcap } from "../lb29/UniversalSupplyAsaProtectedPipeline";
import { FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID } from "../lb34/JuntaSupplyAsaModificationSection";
import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";
import { auditFerreteriaCatalogProjectionParity } from "../lb45/FerreteriaCrossDocumentCatalogProjection";
import { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { applyUniversalEvidenceOverlay } from "../lb54/UniversalEvidenceOverlay";
import { renderFerreteriaProtectedMemory, renderFerreteriaProtectedPpt } from "../lb59/FerreteriaSourceBackedProtectedRenderers";
import { finalizeFerreteriaPcapRenderedOdt } from "../lb60/FerreteriaPcapFinalPostProcessor";
import { readOdtZip } from "../lb23/OdtPackageCodec";

const SOURCE_ID = "profile:CONTR-2026-240267:validated-supply-asa";
const TITLE = "SUMINISTRO DE MATERIALES DE FERRETERÍA PARA LAS INSTALACIONES LOS EDIFICIOS DONDE SE UBICAN LOS SERVICIOS CENTRALES DEL SERVICIO ANDALUZ DE EMPLEO Y SUS OFICINAS ANEXAS";
const OBJECT = "Suministro de materiales y artículos de ferretería para pequeñas reparaciones y reposiciones en los edificios del Servicio Andaluz de Empleo.";
const BUDGET_APPLICATION = "1439010000 G/32L/22000/00 01";

export interface V1PackageDocumentManifest {
  kind: "PCAP" | "MEMORIA" | "PPT";
  fileName: string;
  sha256: string;
  auditReady: boolean;
  blockers: readonly string[];
}

export interface FerreteriaV1ProtectedPackage {
  fileName: string;
  mediaType: "application/zip";
  bytes: Uint8Array;
  sha256: string;
  manifest: {
    caseId: string;
    profile: "FERRETERIA_SUPPLY_ASA_DA33_V1";
    generatedAt: string;
    documents: readonly V1PackageDocumentManifest[];
    crossDocumentAuditReady: boolean;
    blockers: readonly string[];
    humanAcceptanceRequired: true;
  };
}

function sourceReference(): EvidenceReference[] {
  return [{ kind: "PRIMARY_DOCUMENT", sourceId: SOURCE_ID }];
}

function confirmed<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_CONFIRMED",
    sources: sourceReference(),
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function buildSourceBackedBase(caseId: string) {
  const canonical: CanonicalExpedienteState = {
    id: caseId,
    lifecycleState: EstadoExpediente.BORRADOR,
    fields: {
      contractType: confirmed("contractType", "SUPPLY" as const),
      object: confirmed("object", OBJECT),
      cpvMain: confirmed("cpvMain", "44316400-2"),
      lots: confirmed("lots", [] as readonly string[]),
      estimatedValueCents: confirmed("estimatedValueCents", 2_179_315),
      baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 1_055_244),
      procedure: confirmed("procedure", "ABIERTO_SIMPLIFICADO_ABREVIADO"),
      durationMonths: confirmed("durationMonths", 24),
      extensionMonths: confirmed("extensionMonths", 24),
      modificationPercent: confirmed("modificationPercent", 20),
      awardCriteria: confirmed("awardCriteria", ["Precio 100 %"] as readonly string[]),
      solvency: confirmed("solvency", [] as readonly string[]),
      publicity: confirmed("publicity", "Presentación electrónica SiREC"),
    },
    blockers: [],
    warnings: [],
  };
  const expediente = createUniversalExpedienteFromCanonical(canonical);
  expediente.processing = {
    processingType: confirmed("processing.processingType", "ORDINARIA"),
    urgency: confirmed("processing.urgency", false),
    emergency: confirmed("processing.emergency", false),
  };
  expediente.regulation = {
    harmonizedRegulation: confirmed("regulation.harmonizedRegulation", false),
    europeanFunding: confirmed("regulation.europeanFunding", false),
    threshold: confirmed("regulation.threshold", 60_000),
    deadlines: confirmed("regulation.deadlines", {
      ofertasDias: 5,
      adjudicacionDias: 15,
      formalizacionDias: 15,
      subsanacionDias: 3,
      recursoDias: 0,
      ejecucionDias: 730,
      justificacion: "Perfil ASA de compra corriente de bienes disponibles en el mercado; los plazos concretos del expediente se someten al PCAP.",
      normativa: "LCSP art. 159.6",
      articulo: "159.6",
      confidence: 1,
    }),
  };
  expediente.economic = {
    vatPercent: confirmed("economic.vatPercent", 21),
    budgetApplication: confirmed("economic.budgetApplication", BUDGET_APPLICATION),
    annualities: confirmed("economic.annualities", [
      { year: 2026, amountCents: 159_606, vatIncluded: true },
      { year: 2027, amountCents: 638_423, vatIncluded: true },
      { year: 2028, amountCents: 478_816, vatIncluded: true },
    ]),
    fundingSource: confirmed("economic.fundingSource", "AUTOFINANCIADA"),
    priceRevisionRegime: confirmed("economic.priceRevisionRegime", "No procede revisión de precios."),
    unitPrices: confirmed("economic.unitPrices", FERRETERIA_CANONICAL_CATALOG_98.map(item => ({ concept: item.description, unit: "unidad", unitPriceCents: item.unitPriceCentsExVat }))),
    referenceConsumption: confirmed("economic.referenceConsumption", "Consumos históricos de referencia según catálogo de 98 artículos."),
    projectedConsumption: confirmed("economic.projectedConsumption", "Cantidades orientativas; pedidos subordinados a necesidades reales y presupuesto máximo."),
    maximumApprovedBudgetCents: confirmed("economic.maximumApprovedBudgetCents", 1_816_096),
    initialEstimatedValueBaseCents: confirmed("economic.initialEstimatedValueBaseCents", 1_816_096),
    extensionAmountExVatCents: confirmed("economic.extensionAmountExVatCents", 0),
    modificationAmountExVatCents: confirmed("economic.modificationAmountExVatCents", 363_219),
    optionsAmountExVatCents: confirmed("economic.optionsAmountExVatCents", 0),
    otherEstimatedValueComponentsCents: confirmed("economic.otherEstimatedValueComponentsCents", 0),
    legalEstimatedValueCents: confirmed("economic.legalEstimatedValueCents", 2_179_315),
    initialVatAmountCents: confirmed("economic.initialVatAmountCents", 221_601),
    initialPblVatIncludedCents: confirmed("economic.initialPblVatIncludedCents", 1_276_845),
    needsBasedContractDa33: confirmed("economic.needsBasedContractDa33", true),
    budgetCoversEntireContractLife: confirmed("economic.budgetCoversEntireContractLife", true),
    estimatedValueCalculationMethod: confirmed("economic.estimatedValueCalculationMethod", "Presupuesto máximo DA 33.ª para toda la vigencia (18.160,96 €) más modificación prevista al alza del 20 % (3.632,19 €). Las prórrogas no incrementan automáticamente el presupuesto máximo."),
    priceDeterminationRegime: confirmed("economic.priceDeterminationRegime", "Precios unitarios por referencia del catálogo validado de 98 artículos."),
    annualityBudgetRows: confirmed("economic.annualityBudgetRows", [
      { year: 2026, amountCents: 159_606, budgetApplication: BUDGET_APPLICATION, vatIncluded: true },
      { year: 2027, amountCents: 638_423, budgetApplication: BUDGET_APPLICATION, vatIncluded: true },
      { year: 2028, amountCents: 478_816, budgetApplication: BUDGET_APPLICATION, vatIncluded: true },
    ]),
  };
  expediente.administrative = {
    contractingAuthority: confirmed("administrative.contractingAuthority", "Dirección Gerencia del Servicio Andaluz de Empleo"),
    promotingUnit: confirmed("administrative.promotingUnit", "Servicio de Administración General y Contratación"),
    competentBody: confirmed("administrative.competentBody", "Dirección Gerencia del Servicio Andaluz de Empleo"),
    administrativeFileNumber: confirmed("administrative.administrativeFileNumber", "CONTR/2026/240267"),
    contractManager: confirmed("administrative.contractManager", "Persona responsable del contrato designada por el órgano de contratación"),
    reservedContractDa4: confirmed("administrative.reservedContractDa4", false),
  };
  expediente.technical = {
    technicalPurpose: confirmed("technical.technicalPurpose", OBJECT),
    technicalRequirements: confirmed("technical.technicalRequirements", ["Catálogo cerrado de 98 referencias", "Plazo máximo de entrega de cinco días hábiles", "Sustitución de material defectuoso sin coste"]),
    executionLocations: confirmed("technical.executionLocations", ["Servicio Andaluz de Empleo, calle Leonardo Da Vinci, 19B, Isla de la Cartuja, Sevilla"]),
    subrogationRequired: confirmed("technical.subrogationRequired", false),
    subrogationRegime: confirmed("technical.subrogationRegime", "No procede."),
  };
  expediente.lots = {
    divisionIntoLots: confirmed("lots.divisionIntoLots", false),
    lots: confirmed("lots.lots", []),
    maxOfferableLots: confirmed("lots.maxOfferableLots", 1),
    maxAwardableLots: confirmed("lots.maxAwardableLots", 1),
    noDivisionJustification: confirmed("lots.noDivisionJustification", "Gestión unificada por coordinación y control del suministro, homogeneidad de calidad y economías de escala en gestión, logística y transporte."),
  };
  expediente.guarantees = {
    provisionalGuaranteeRequired: confirmed("guarantees.provisionalGuaranteeRequired", false),
    provisionalGuaranteePercent: confirmed("guarantees.provisionalGuaranteePercent", 0),
    definitiveGuaranteePercent: confirmed("guarantees.definitiveGuaranteePercent", 0),
    complementaryGuaranteePercent: confirmed("guarantees.complementaryGuaranteePercent", 0),
  };
  expediente.execution = {
    specialExecutionConditions: confirmed("execution.specialExecutionConditions", ["Retirada de embalajes", "Acreditación de reciclaje en los supuestos definidos en el PCAP"]),
    specificPenalties: confirmed("execution.specificPenalties", ["Demora: 10,00 € IVA excluido por día hábil y pedido, con máximo acumulado del 50 % del valor neto del pedido afectado", "Condiciones especiales: régimen del apartado 8.B del Anexo I"]),
    subcontractingRegime: confirmed("execution.subcontractingRegime", "No se declaran tareas críticas de ejecución directa; se aplica el régimen del PCAP y LCSP."),
    assignmentRegime: confirmed("execution.assignmentRegime", "Sí, conforme al apartado 15 del PCAP."),
    paymentRegime: confirmed("execution.paymentRegime", "Pagos parciales en función de pedidos realizados y conformados."),
    receiptAndAcceptanceRegime: confirmed("execution.receiptAndAcceptanceRegime", "Conformidad en un máximo de 30 días naturales desde entrega y recepción material."),
    extensionStructure: confirmed("execution.extensionStructure", "Dos prórrogas de hasta 12 meses cada una; máximo conjunto 24 meses."),
    extensionNoticeMonths: confirmed("execution.extensionNoticeMonths", 2),
    plannedModificationRegime: confirmed("execution.plannedModificationRegime", FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID),
  };
  expediente.criteria = {
    awardCriteria: confirmed("criteria.awardCriteria", [new CriterioAdjudicacion("Proposición económica: precio", 100, true)]),
    economicSolvency: confirmed("criteria.economicSolvency", []),
    technicalSolvency: confirmed("criteria.technicalSolvency", []),
    judgmentCriteriaExist: confirmed("criteria.judgmentCriteriaExist", false),
    singleCriterionMotivation: confirmed("criteria.singleCriterionMotivation", "El precio es el único criterio por tratarse de prestaciones homogéneas y perfectamente definidas técnicamente, sin elementos cualitativos adicionales susceptibles de valoración que aporten una ventaja objetiva al contrato."),
  };
  expediente.traceability = { decisions: [], events: [], sourceRegistry: sourceReference() };
  return expediente;
}

function profileSignature(record: UniversalEvidenceRecord): string[] {
  const blockers: string[] = [];
  const expected: Array<[string, unknown]> = [
    ["contractType", "SUPPLY"],
    ["cpvMain", "44316400-2"],
    ["baseTenderBudgetCents", 1_055_244],
    ["durationMonths", 24],
    ["extensionMonths", 24],
    ["economic.needsBasedContractDa33", true],
    ["economic.maximumApprovedBudgetCents", 1_816_096],
    ["economic.legalEstimatedValueCents", 2_179_315],
    ["lots.divisionIntoLots", false],
  ];
  for (const [path, value] of expected) {
    const field = record.fields[path];
    if (!field || JSON.stringify(field.value) !== JSON.stringify(value)) blockers.push(`El expediente no coincide con el perfil V1 validado: ${path}.`);
  }
  const unitPrices = record.fields["economic.unitPrices"]?.value;
  if (!Array.isArray(unitPrices) || unitPrices.length !== 98) blockers.push("El perfil V1 exige las 98 referencias unitarias validadas.");
  return blockers;
}

function contentText(bytes: Uint8Array): string {
  const content = readOdtZip(bytes).find(item => item.name === "content.xml");
  if (!content) return "";
  return Buffer.from(content.bytes).toString("utf8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function auditCrossDocuments(pcap: Uint8Array, memory: Uint8Array, ppt: Uint8Array): string[] {
  const blockers: string[] = [];
  const parity = auditFerreteriaCatalogProjectionParity();
  if (!parity.ready) blockers.push(...parity.blockers);
  const pcapText = contentText(pcap);
  const memoryText = contentText(memory);
  const pptText = contentText(ppt);
  for (const [label, text] of [["PCAP", pcapText], ["Memoria", memoryText]] as const) {
    if (!text.includes("21.793,15")) blockers.push(`${label}: no contiene el VE validado de 21.793,15 €.`);
    if (!text.includes("18.160,96")) blockers.push(`${label}: no contiene el presupuesto máximo DA 33.ª de 18.160,96 €.`);
  }
  for (const [label, text] of [["PCAP", pcapText], ["PPT", pptText]] as const) {
    const missing = FERRETERIA_CANONICAL_CATALOG_98.filter(item => !text.includes(item.description));
    if (missing.length) blockers.push(`${label}: faltan ${missing.length} referencias canónicas.`);
  }
  if (!memoryText.includes("sin incorporar artículos nuevos") || !pptText.includes("no habilita la incorporación de artículos nuevos")) blockers.push("Memoria/PPT: no queda protegida de forma coherente la prohibición de artículos nuevos mediante la modificación prevista.");
  return blockers;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes: Uint8Array): number { let crc = 0xffffffff; for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }

function zipStored(files: readonly { name: string; bytes: Uint8Array }[]): Uint8Array {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.from(file.bytes);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc32(data), 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26); name.copy(local, 30);
    locals.push(local, data);
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(0, 10);
    central.writeUInt32LE(crc32(data), 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42); name.copy(central, 46);
    centrals.push(central); offset += local.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10); eocd.writeUInt32LE(directory.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, eocd]);
}

export async function generateFerreteriaV1ProtectedPackage(args: {
  caseId: string;
  evidence: UniversalEvidenceRecord;
  binaryStore: UniversalEditableTemplateBinaryStore;
  procurementDate?: string;
}): Promise<FerreteriaV1ProtectedPackage> {
  const signatureBlockers = profileSignature(args.evidence);
  if (signatureBlockers.length) throw new Error(`No existe renderer V1 validado para este perfil: ${signatureBlockers.join(" ")}`);
  const base = buildSourceBackedBase(args.caseId);
  const overlay = applyUniversalEvidenceOverlay(base, args.evidence.fields);
  if (!overlay.ready) throw new Error(`La evidencia universal no puede promocionarse: ${overlay.blocked.join(" ")}`);

  const pcapBase = await renderSupplyAsaProtectedPcap(overlay.expediente, args.procurementDate ?? "2026-08-24", args.binaryStore);
  if (!pcapBase.document || !pcapBase.packageAuditReady) throw new Error(`PCAP protegido no supera la auditoría de integridad previa a LB60: ${pcapBase.packageAuditBlockers.join(" ")}`);
  const pcap = finalizeFerreteriaPcapRenderedOdt({ bytes: pcapBase.document.bytes, caseId: args.caseId, title: TITLE });
  if (!pcap.auditReady) throw new Error(`PCAP final no supera LB60 + LB35: ${pcap.blockers.join(" ")}`);
  const memory = await renderFerreteriaProtectedMemory(args.binaryStore);
  const ppt = await renderFerreteriaProtectedPpt(args.binaryStore);
  const crossBlockers = auditCrossDocuments(pcap.bytes, memory.bytes, ppt.bytes);

  const documents: V1PackageDocumentManifest[] = [
    { kind: "PCAP", fileName: `PCAP_${args.caseId.replaceAll("/", "-")}.odt`, sha256: pcap.sha256, auditReady: pcap.auditReady, blockers: pcap.blockers },
    { kind: "MEMORIA", fileName: `Memoria_${args.caseId.replaceAll("/", "-")}.odt`, sha256: memory.renderedSha256, auditReady: memory.auditReady, blockers: memory.auditBlockers },
    { kind: "PPT", fileName: `PPT_${args.caseId.replaceAll("/", "-")}.odt`, sha256: ppt.renderedSha256, auditReady: ppt.auditReady, blockers: ppt.auditBlockers },
  ];
  const blockers = [...documents.flatMap(item => item.auditReady ? [] : item.blockers), ...crossBlockers];
  const generatedAt = new Date().toISOString();
  const manifest = {
    caseId: args.caseId,
    profile: "FERRETERIA_SUPPLY_ASA_DA33_V1" as const,
    generatedAt,
    documents,
    crossDocumentAuditReady: blockers.length === 0,
    blockers,
    humanAcceptanceRequired: true as const,
  };
  if (blockers.length) throw new Error(`El paquete documental no supera la auditoría protegida: ${blockers.join(" ")}`);
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2), "utf8");
  const zipped = zipStored([
    { name: documents[0]!.fileName, bytes: pcap.bytes },
    { name: documents[1]!.fileName, bytes: memory.bytes },
    { name: documents[2]!.fileName, bytes: ppt.bytes },
    { name: "manifest.json", bytes: manifestBytes },
  ]);
  return {
    fileName: `Contrata-IA_${args.caseId.replaceAll("/", "-")}_PCAP-Memoria-PPT.zip`,
    mediaType: "application/zip",
    bytes: zipped,
    sha256: createHash("sha256").update(zipped).digest("hex"),
    manifest,
  };
}
