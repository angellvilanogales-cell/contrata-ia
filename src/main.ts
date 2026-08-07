import {
  EnvironmentConfiguration,
  getCanonicalArchitecture
} from "./architecture";

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

if (require.main === module) {
  console.log(JSON.stringify(createApplication()));
}
