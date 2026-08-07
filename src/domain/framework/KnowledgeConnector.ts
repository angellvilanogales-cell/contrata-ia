import type { KnowledgeMatch } from "./FrameworkTypes";

export interface KnowledgeProvider {
  search(query: string): KnowledgeMatch[];
}

export class KnowledgeConnector {
  public constructor(private readonly providers: KnowledgeProvider[] = []) {}
  public hybrid(query: string): KnowledgeMatch[] {
    const seen = new Set<string>();
    const matches: KnowledgeMatch[] = [];
    for (const provider of this.providers) {
      for (const match of provider.search(query)) {
        if (!seen.has(match.pack.id)) {
          seen.add(match.pack.id);
          matches.push(match);
        }
      }
    }
    return matches;
  }
}
