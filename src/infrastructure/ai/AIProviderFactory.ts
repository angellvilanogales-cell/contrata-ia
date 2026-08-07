import type { AIProvider, AIProviderType } from "./AIProvider";
import { ProviderRegistry } from "./providers/ProviderRegistry";

export class AIProviderFactory {
  public constructor(private readonly registry: ProviderRegistry) {}
  public create(type: AIProviderType | string): AIProvider {
    return this.registry.get(String(type));
  }
}
