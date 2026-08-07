import {
  EnvironmentConfiguration,
  getCanonicalArchitecture
} from "./architecture";
import { runVerticalDemo } from "./application/vertical/VerticalSlice";

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
    const result = await runVerticalDemo();
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

  console.log(JSON.stringify(createApplication()));
}

if (require.main === module) {
  void run();
}
