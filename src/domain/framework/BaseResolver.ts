import type { ResolverContext, ResolverDecision } from "./FrameworkTypes";

export abstract class BaseResolver<T> {
  protected constructor(public readonly name: string) {}
  public abstract resolve(context: ResolverContext): ResolverDecision<T>;
}
