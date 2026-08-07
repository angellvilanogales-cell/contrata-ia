import {
  EnvironmentConfiguration,
  getCanonicalArchitecture
} from "./architecture";
import { executeLB4CleaningDemo, executeVerticalDemo } from "./runtime";

export interface ApplicationInfo {
  name: "contrata-ia";
  version: string;
  status: "initialized";
  architectureVersion: string;
  canonicalComponents: number;
  environment: string;
}

export function createApplication(): ApplicationInfo {
  const architecture = getCanonicalArchitecture();
  const configuration = new EnvironmentConfiguration();

  return {
    name: "contrata-ia",
    version: "0.1.0",
    status: "initialized",
    architectureVersion: architecture.architectureVersion,
    canonicalComponents: architecture.components.length,
    environment: configuration.nodeEnv
  };
}

async function run(): Promise<void> {
  if (process.argv.includes("--vertical-demo")) {
    const result = await executeVerticalDemo();
    console.log(JSON.stringify({
      expedienteId: result.expediente.id,
      status: result.expediente.status,
      decisions: result.expediente.decisions.length,
      documentType: result.expediente.document?.type,
      exports: ["json", "html"],
      auditEntries: result.audit.length
    }));
    return;
  }

  if (process.argv.includes("--lb4-cleaning-demo")) {
    const result = executeLB4CleaningDemo();
    console.log(JSON.stringify({
      scope: result.scope,
      effectivePeriod: result.effectivePeriod,
      cpv: result.cpv.primary,
      procedure: result.procedure.procedure,
      sara: result.procedure.sara,
      lots: result.lots.result,
      economicSolvencyMinimum: result.solvency.economic.calculatedMinimum,
      definitiveGuaranteePercent: result.guarantees.definitive.percentOfFinalPriceExVat,
      subrogation: result.subrogation.status,
      traceEntries: result.traces.length,
      validation: result.overallValidation
    }));
    return;
  }

  console.log(JSON.stringify(createApplication()));
}

if (require.main === module) {
  void run();
}
