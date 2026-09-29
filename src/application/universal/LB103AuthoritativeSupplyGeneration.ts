import type { UniversalEditableTemplateBinaryStore } from "../intake/lb23/UniversalOdtProductionRenderer";
import type { UniversalEvidenceRecord } from "../intake/lb52/UniversalEvidenceWorkspace";
import {
  generateSupplyUserDocumentPackage,
  type SupplyUserDocumentPackage,
} from "../intake/lb95/SupplyUserDocumentPackageGenerator";
import type { AdaptiveStoredCase } from "../../infrastructure/operations/lb7/AdaptiveCaseStore";
import { generateServiceUserDocumentPackage, type ServiceUserDocumentPackage } from "../intake/lb96/ServiceUserDocumentPackageGenerator";
import { selectedLB103TemplateStore } from "./LB103SelectedTemplateStore";
import {
  evaluateLB103ServerValidatedPreflight,
  type LB103ServerValidatedPreflight,
} from "./LB103ServerValidatedPreflight";

export interface LB103PresentedGenerationSeals {
  snapshotSha256: string;
  documentarySelectionSha256: string;
}

export interface LB103AuthoritativeSupplyGenerationResult {
  ready: boolean;
  preflight: LB103ServerValidatedPreflight;
  package: SupplyUserDocumentPackage | ServiceUserDocumentPackage | null;
  blockers: readonly string[];
  humanAcceptanceStillRequired: true;
  productionReady: false;
}

type SupplyPackageGenerator = (input: {
  record: UniversalEvidenceRecord;
  templateStore: UniversalEditableTemplateBinaryStore;
  authoritativeSeals?: LB103PresentedGenerationSeals;
}) => Promise<SupplyUserDocumentPackage>;

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function documentaryEvidence(evidence: UniversalEvidenceRecord["fields"]): UniversalEvidenceRecord["fields"] {
  return Object.fromEntries(Object.entries(evidence).filter(([key]) => !key.startsWith("closure.")));
}

function documentaryUpdatedAt(evidence: UniversalEvidenceRecord["fields"], fallback: string): string {
  const validated = Object.entries(evidence)
    .filter(([key]) => !key.startsWith("closure."))
    .map(([, field]) => field.humanValidation?.at)
    .filter((value): value is string => Boolean(value))
    .sort();
  return validated.at(-1) ?? fallback;
}

/**
 * Unión autoritativa entre /adaptive y el generador Supply ya existente.
 *
 * El navegador solo puede presentar los dos sellos que acaba de recibir del
 * preflight. El servidor reconstruye de nuevo snapshot y selección documental,
 * compara ambas identidades y únicamente entonces reutiliza el generador
 * atómico Supply. No se aceptan datos documentales ni decisiones jurídicas
 * suministradas por el cliente en la petición de generación.
 */
export async function generateLB103AuthoritativeSupplyPackage(input: {
  caseValue: AdaptiveStoredCase;
  presentedSeals: LB103PresentedGenerationSeals;
  templateStore: UniversalEditableTemplateBinaryStore;
  generator?: SupplyPackageGenerator;
}): Promise<LB103AuthoritativeSupplyGenerationResult> {
  const caseValue = structuredClone(input.caseValue);
  const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
  const blockers: string[] = [];

  // La fase LB103 del navegador es solo una ayuda de navegación y puede
  // quedar obsoleta tras completar decisiones desde la recuperación
  // documental. La autorización se deriva de la evidencia persistida y
  // validada que reconstruye este preflight en el servidor.
  if (!preflight.snapshotReady || !preflight.snapshot) {
    blockers.push("El servidor no puede reconstruir un snapshot canónico validado.");
  }
  if (!preflight.packageReady || !preflight.documentarySelection) {
    blockers.push("La selección documental autoritativa no está preparada para generación.");
  }
  if (preflight.completion && !preflight.completion.ready) blockers.push(...preflight.completion.blockers);

  if (!isSha256(input.presentedSeals.snapshotSha256)) {
    blockers.push("El sello de snapshot presentado por /adaptive no es un SHA-256 válido.");
  }
  if (!isSha256(input.presentedSeals.documentarySelectionSha256)) {
    blockers.push("El sello de selección documental presentado por /adaptive no es un SHA-256 válido.");
  }

  if (preflight.snapshot && input.presentedSeals.snapshotSha256 !== preflight.snapshot.sha256) {
    blockers.push("El snapshot presentado por /adaptive diverge del snapshot reconstruido por el servidor.");
  }
  if (
    preflight.documentarySelection &&
    input.presentedSeals.documentarySelectionSha256 !== preflight.documentarySelection.sha256
  ) {
    blockers.push("La selección documental presentada por /adaptive diverge de la selección reconstruida por el servidor.");
  }

  if (preflight.snapshot?.contractType === "SUPPLY" && preflight.snapshot.procedure !== "ABIERTO_SIMPLIFICADO_ABREVIADO") {
    blockers.push("La terna Supply acreditada exige procedimiento abierto simplificado abreviado.");
  }
  if (preflight.snapshot?.contractType === "SUPPLY" && !["AUTOFINANCED", "EU_FUNDS"].includes(preflight.snapshot.financing)) {
    blockers.push("La terna Supply exige una financiación con modelo PCAP oficial acreditado.");
  }

  if (blockers.length > 0) {
    return {
      ready: false,
      preflight,
      package: null,
      blockers,
      humanAcceptanceStillRequired: true,
      productionReady: false,
    };
  }

  const record: UniversalEvidenceRecord = {
    caseId: caseValue.caseId,
    fields: documentaryEvidence(caseValue.universalEvidence ?? {}),
    updatedAt: documentaryUpdatedAt(caseValue.universalEvidence ?? {}, caseValue.updatedAt),
  };
  const protectedStore = selectedLB103TemplateStore(input.templateStore, preflight.documentarySelection!);
  const pkg = preflight.snapshot!.contractType === "SERVICE"
    ? await generateServiceUserDocumentPackage({ record, templateStore: protectedStore })
    : await (input.generator ?? generateSupplyUserDocumentPackage)({ record, templateStore: protectedStore, authoritativeSeals: {...input.presentedSeals} });

  if (!pkg.ready || !pkg.bytes || !pkg.manifest) {
    return {
      ready: false,
      preflight,
      package: pkg,
      blockers: pkg.blockers.length ? pkg.blockers : ["El generador documental no produjo un paquete utilizable."],
      humanAcceptanceStillRequired: true,
      productionReady: false,
    };
  }

  return {
    ready: true,
    preflight,
    package: pkg,
    blockers: [],
    humanAcceptanceStillRequired: true,
    productionReady: false,
  };
}
