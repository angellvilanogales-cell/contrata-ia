import type { PromptTemplate } from "./PromptTemplate";

export class PromptBuilder {
  public build(template: PromptTemplate, variables: Record<string, string | number | boolean>): string {
    return template.template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => String(variables[key] ?? ""));
  }
}
