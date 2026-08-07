import type { ApplicationConfiguration } from "../contracts";

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export class EnvironmentConfiguration implements ApplicationConfiguration {
  public readonly nodeEnv: string;
  public readonly logLevel: string;
  public readonly aiEnabled: boolean;

  public constructor(env: NodeJS.ProcessEnv = process.env) {
    this.nodeEnv = env.NODE_ENV ?? "development";
    this.logLevel = env.LOG_LEVEL ?? "info";
    this.aiEnabled = parseBoolean(env.AI_ENABLED, false);
  }
}
