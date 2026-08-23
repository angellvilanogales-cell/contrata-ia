import { UniversalEditableTemplateAsset } from "../lb18/UniversalEditableTemplateRendering";
import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../lb23/JuntaOfficialEditableTemplateDiscovery";

export const JDA_SUPPLY_ASA_TEMPLATE_ID = "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17" as const;

/**
 * Manifiesto obtenido por inspección física del ODT oficial aportado para la
 * activación V1 el 23/08/2026. Los hashes se calculan sobre los bytes exactos y
 * sobre styles.xml + automatic-styles(content.xml) + settings.xml utilizando el
 * mismo algoritmo que UniversalOdtProductionRenderer.
 */
export const JDA_SUPPLY_ASA_VERIFIED_MANIFEST = {
  sourceId: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.sourceId,
  fileName: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.fileName,
  mediaType: "application/vnd.oasis.opendocument.text",
  byteLength: 508_759,
  contentHash: "sha256:45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
  styleFingerprint: "sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee",
  verifiedAt: "2026-08-23",
  modelStatement: "Modelo de PCAP recomendado por la Comisión Consultiva de Contratación Pública para suministro mediante procedimiento abierto simplificado abreviado; actualizado en diciembre de 2025.",
} as const;

export const JDA_SUPPLY_ASA_EDITABLE_ASSET: UniversalEditableTemplateAsset = {
  templateId: JDA_SUPPLY_ASA_TEMPLATE_ID,
  sourceId: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.sourceId,
  documentKind: "PCAP",
  format: "ODT",
  mediaType: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.mediaType,
  contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
  styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
  slotIds: [
    "pcap.anexoI.1.objeto",
    "pcap.anexoI.1.cpv",
    "pcap.anexoI.1A.lotes",
    "pcap.anexoI.2.pbl",
    "pcap.anexoI.2.valorEstimado",
    "pcap.anexoI.3.duracion",
    "pcap.anexoI.3.prorrogas",
    "pcap.anexoI.7.criterios",
    "pcap.anexoI.8.condicionesEspeciales",
  ],
  editable: true,
};

/**
 * Bindings contrastados contra content.xml del original exacto. Cada xmlToken
 * aparece una sola vez y cada valueToken aparece una sola vez dentro de su
 * anclaje. El renderer sustituye únicamente valueToken y conserva los spans y
 * estilos del ODT.
 */
export const JDA_SUPPLY_ASA_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  {
    slotId: "pcap.anexoI.1.objeto", part: "content.xml", sourceSection: "ANEXO I / 1", sourceLabel: "Objeto del contrato",
    xmlToken: '<text:p text:style-name="P359"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T109">Objeto del contrato: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T185">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.1.cpv", part: "content.xml", sourceSection: "ANEXO I / 1", sourceLabel: "Código CPV",
    xmlToken: '<text:span text:style-name="T62">: </text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T184">_______</text:span></text:span><text:span text:style-name="T62"> </text:span></text:p><text:p text:style-name="P36"/><text:p text:style-name="P12">Especificaciones del objeto del contrato:',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.1A.lotes", part: "content.xml", sourceSection: "ANEXO I / 1.A", sourceLabel: "Descripción de los lotes",
    xmlToken: '<text:p text:style-name="P410"><text:span text:style-name="T62">LOTE 1. </text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2.pbl", part: "content.xml", sourceSection: "ANEXO I / 2.A", sourceLabel: "Importe total (IVA incluido)",
    xmlToken: '<text:p text:style-name="P401"><text:span text:style-name="T62">Importe total (IVA incluido): <text:s/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">_______</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T110">euros.</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2.valorEstimado", part: "content.xml", sourceSection: "ANEXO I / 2.B", sourceLabel: "Valor estimado del contrato",
    xmlToken: '<text:p text:style-name="P466"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T318">Valor estimado del contrato: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T327">_______</text:span></text:span>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.3.duracion", part: "content.xml", sourceSection: "ANEXO I / 3", sourceLabel: "Plazo total (en meses)",
    xmlToken: '<text:p text:style-name="P471"><text:span text:style-name="T134">Plazo total</text:span><text:span text:style-name="T62"> (en meses): </text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.3.prorrogas", part: "content.xml", sourceSection: "ANEXO I / 3", sourceLabel: "Duración de la prórroga",
    xmlToken: '<text:p text:style-name="P175">Duración de la prórroga: <text:span text:style-name="T1098">_______</text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.7.criterios", part: "content.xml", sourceSection: "ANEXO I / 7", sourceLabel: "Único criterio de adjudicación relacionado con los costes",
    xmlToken: '<text:p text:style-name="P258"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter.">Único criterio de adjudicación relacionado con los costes:</text:span> <text:span text:style-name="T1098">Sí/No</text:span></text:p>',
    valueToken: "Sí/No",
  },
  {
    slotId: "pcap.anexoI.8.condicionesEspeciales", part: "content.xml", sourceSection: "ANEXO I / 8.A", sourceLabel: "Condición especial de ejecución de tipo ambiental o social",
    xmlToken: '</text:note></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T498">: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T488">_______</text:span></text:span></text:p><text:p text:style-name="P489">',
    valueToken: "_______",
  },
] as const;

function euroCents(value: unknown, fieldKey: string): string {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${fieldKey} debe ser un entero de céntimos no negativo.`);
  const cents = value as number;
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

function lotsV1(value: unknown, fieldKey: string): string {
  if (!Array.isArray(value) || value.length !== 1) throw new Error(`${fieldKey}: el binding V1 actual solo admite exactamente un lote; la pluralidad requiere bindings físicos adicionales.`);
  const lot = value[0] as { name?: { value?: unknown } };
  const name = lot?.name?.value;
  if (typeof name !== "string" || !name.trim()) throw new Error(`${fieldKey}: el lote único debe conservar un nombre validado.`);
  return name.trim();
}

function priceOnlyCriterionV1(value: unknown, fieldKey: string): string {
  if (!Array.isArray(value) || value.length !== 1) throw new Error(`${fieldKey}: este binding físico solo cubre el supuesto V1 de criterio único precio.`);
  const criterion = value[0] as { nombre?: unknown; ponderacion?: unknown; evaluableMedianteFormula?: unknown };
  const name = typeof criterion?.nombre === "string" ? criterion.nombre.toLowerCase() : "";
  if (!/(precio|proposición económica|proposicion economica)/.test(name) || criterion.ponderacion !== 100 || criterion.evaluableMedianteFormula !== true) {
    throw new Error(`${fieldKey}: el modelo no se marcará como criterio único de costes salvo precio 100% evaluable por fórmula.`);
  }
  return "Sí";
}

function specialConditions(value: unknown, fieldKey: string): string {
  if (!Array.isArray(value) || value.length === 0 || !value.every(item => typeof item === "string" && item.trim())) {
    throw new Error(`${fieldKey}: se requieren condiciones especiales textuales ya validadas.`);
  }
  return (value as string[]).map(item => item.trim()).join("; ");
}

export const JDA_SUPPLY_ASA_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    "pcap.anexoI.2.pbl": euroCents,
    "pcap.anexoI.2.valorEstimado": euroCents,
    "pcap.anexoI.1A.lotes": lotsV1,
    "pcap.anexoI.7.criterios": priceOnlyCriterionV1,
    "pcap.anexoI.8.condicionesEspeciales": specialConditions,
  },
};

export const JDA_SUPPLY_ASA_ACTIVATION_LIMITATIONS = [
  "El manifiesto y los nueve bindings físicos existentes ya están verificados contra el original exacto.",
  "El activo binario no se incorpora al repositorio como texto ni se reconstruye: el runtime debe cargar los bytes exactos cuyo SHA-256 figure en el manifiesto.",
  "El perfil físico actual cubre únicamente los nueve slots semánticos registrados en LB22; no certifica que el resto de campos a cumplimentar del Anexo I estén todavía automatizados.",
  "El binding de lotes se limita deliberadamente a un único lote y el de criterios al supuesto de precio 100% evaluable mediante fórmula; cualquier otro caso se bloquea.",
] as const;
