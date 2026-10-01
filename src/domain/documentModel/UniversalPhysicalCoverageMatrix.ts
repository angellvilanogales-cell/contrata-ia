import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { assessProtectedEditableAssetManifest } from "./ProtectedEditableAssetManifest";
import { assessUniversalPhysicalModelReadiness } from "./UniversalPhysicalModelReadiness";

export interface PhysicalCoverageMatrixRow {
  id: string;
  contractType: UniversalTargetContractType;
  procedure: TipoProcedimiento;
  scope: "PROTECTED_CASE" | "UNIVERSAL_FAMILY";
  physicalPackageReady: boolean;
  blockers: readonly string[];
}

export function buildUniversalPhysicalCoverageMatrix(): readonly PhysicalCoverageMatrixRow[] {
  const protectedSupply = assessProtectedEditableAssetManifest("CONTR/2026/240267");
  const rows: PhysicalCoverageMatrixRow[] = [{
    id: "CONTR/2026/240267",
    contractType: "SUPPLY",
    procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
    scope: "PROTECTED_CASE",
    physicalPackageReady: protectedSupply.ready,
    blockers: protectedSupply.blockers,
  }];

  const families: readonly [UniversalTargetContractType, TipoProcedimiento][] = [
    ["SUPPLY", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    ["SERVICE", TipoProcedimiento.ABIERTO],
    ["WORKS", TipoProcedimiento.ABIERTO],
    ["CONCESSION", TipoProcedimiento.ABIERTO],
    ["MIXED", TipoProcedimiento.ABIERTO],
  ];

  for (const [contractType, procedure] of families) {
    const readiness = assessUniversalPhysicalModelReadiness({ contractType, procedure });
    rows.push({
      id: `UNIVERSAL-${contractType}-${procedure}`,
      contractType,
      procedure,
      scope: "UNIVERSAL_FAMILY",
      physicalPackageReady: readiness.ready,
      blockers: readiness.blockers,
    });
  }
  return rows;
}

export function canClaimUniversalPhysicalDocumentCoverage(): boolean {
  return buildUniversalPhysicalCoverageMatrix()
    .filter(row => row.scope === "UNIVERSAL_FAMILY")
    .every(row => row.physicalPackageReady);
}
