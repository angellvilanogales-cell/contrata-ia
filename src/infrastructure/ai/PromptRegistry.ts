import type { PromptTemplate } from "./PromptTemplate";

export class PromptRegistry {
  private readonly templates = new Map<string, PromptTemplate>();
  public register(template: PromptTemplate): void { this.templates.set(template.id, template); }
  public get(id: string): PromptTemplate | undefined { return this.templates.get(id); }
}
