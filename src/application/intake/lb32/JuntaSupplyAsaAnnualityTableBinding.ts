import { UniversalAnnualityBudgetRow } from "../../../domain/expediente/UniversalExpedienteDomains";
import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../lb25/JuntaSupplyAsaOfficialActivation";
import {
  JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB31_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES,
} from "../lb31/JuntaSupplyAsaRemainingPhysicalClosure";

const ANNUALITY_TABLE_ORIGINAL = '<table:table table:name="Tabla1" table:style-name="Tabla1"><table:table-column table:style-name="Tabla1.A"/><table:table-column table:style-name="Tabla1.B"/><table:table-column table:style-name="Tabla1.C"/><table:table-row table:style-name="Tabla1.1"><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P102">Año</text:p></table:table-cell><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P102">Importe</text:p></table:table-cell><table:table-cell table:style-name="Tabla1.C1" office:value-type="string"><text:p text:style-name="P102"><text:span text:style-name="T1476">Partida</text:span> Presupuestaria</text:p></table:table-cell></table:table-row><table:table-row table:style-name="Tabla1.2"><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P464"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108"/></text:span></text:p></table:table-cell><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P59"/></table:table-cell><table:table-cell table:style-name="Tabla1.C1" office:value-type="string"><text:p text:style-name="P59"/></table:table-cell></table:table-row><table:table-row table:style-name="Tabla1.2"><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P59"/></table:table-cell><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P59"/></table:table-cell><table:table-cell table:style-name="Tabla1.C1" office:value-type="string"><text:p text:style-name="P59"/></table:table-cell></table:table-row></table:table>';

export const JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING: UniversalOdtPhysicalSlotBinding = {
  slotId: "pcap.anexoI.2A.anualidadesTabla",
  part: "content.xml",
  sourceSection: "ANEXO I / 2.A",
  sourceLabel: "Anualidades (IVA incluido): Año / Importe / Partida Presupuestaria",
  xmlToken: ANNUALITY_TABLE_ORIGINAL,
  escapeMode: "RAW_XML",
};

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function euroCents(cents: number): string {
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

function annualityTable(value: unknown, fieldKey: string): string {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${fieldKey}: se requieren filas de anualidad validadas.`);
  const rows = value as readonly UniversalAnnualityBudgetRow[];
  const years = new Set<number>();
  for (const row of rows) {
    if (!Number.isSafeInteger(row.year) || row.year < 2000 || row.year > 2200) throw new Error(`${fieldKey}: año de anualidad inválido.`);
    if (years.has(row.year)) throw new Error(`${fieldKey}: anualidad duplicada ${row.year}.`);
    years.add(row.year);
    if (!Number.isSafeInteger(row.amountCents) || row.amountCents < 0) throw new Error(`${fieldKey}: importe inválido para ${row.year}.`);
    if (row.vatIncluded !== true) throw new Error(`${fieldKey}: la tabla oficial exige anualidades IVA incluido.`);
    if (typeof row.budgetApplication !== "string" || !row.budgetApplication.trim()) throw new Error(`${fieldKey}: falta partida presupuestaria para ${row.year}.`);
  }

  const header = '<table:table table:name="Tabla1" table:style-name="Tabla1"><table:table-column table:style-name="Tabla1.A"/><table:table-column table:style-name="Tabla1.B"/><table:table-column table:style-name="Tabla1.C"/><table:table-row table:style-name="Tabla1.1"><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P102">Año</text:p></table:table-cell><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P102">Importe</text:p></table:table-cell><table:table-cell table:style-name="Tabla1.C1" office:value-type="string"><text:p text:style-name="P102"><text:span text:style-name="T1476">Partida</text:span> Presupuestaria</text:p></table:table-cell></table:table-row>';
  const body = rows.map(row => `<table:table-row table:style-name="Tabla1.2"><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P464"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">${row.year}</text:span></text:span></text:p></table:table-cell><table:table-cell table:style-name="Tabla1.A1" office:value-type="string"><text:p text:style-name="P59">${escapeXml(euroCents(row.amountCents))} €</text:p></table:table-cell><table:table-cell table:style-name="Tabla1.C1" office:value-type="string"><text:p text:style-name="P59">${escapeXml(row.budgetApplication.trim())}</text:p></table:table-cell></table:table-row>`).join("");
  return `${header}${body}</table:table>`;
}

export const JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET = {
  ...JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET,
  slotIds: [...JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET.slotIds, JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING.slotId],
} as const;

export const JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  ...JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING,
] as const;

export const JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_LB31_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.2A.anualidadesTabla": annualityTable as UniversalTemplateValueFormatter,
  },
};

export const FERRETERIA_ANNUALITY_BUDGET_ROWS: readonly UniversalAnnualityBudgetRow[] = [
  { year: 2026, amountCents: 159_606, budgetApplication: "1439010000 G/32L/22000/00 01", vatIncluded: true },
  { year: 2027, amountCents: 638_423, budgetApplication: "1439010000 G/32L/22000/00 01", vatIncluded: true },
  { year: 2028, amountCents: 478_816, budgetApplication: "1439010000 G/32L/22000/00 01", vatIncluded: true },
] as const;

export const JDA_SUPPLY_ASA_LB32_REMAINING_ISSUES = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.filter(
  issue => issue.id !== "annualities-budget-table",
);

export function evaluateJdaSupplyAsaLb32PhysicalClosure() {
  const blockers = JDA_SUPPLY_ASA_LB32_REMAINING_ISSUES.filter(issue => issue.blockingForFullRender);
  return {
    safeBindingCount: JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS.length,
    remainingBlockingCount: blockers.length,
    fullPhysicalCoverageReady: blockers.length === 0,
    blockers,
  } as const;
}
