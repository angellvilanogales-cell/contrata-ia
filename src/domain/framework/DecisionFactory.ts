import type { ResolverDecision } from "./FrameworkTypes";
import type { TraceEntry } from "../common/types";

export class DecisionFactory {
  public static success<T>(value: T, reason = ""): ResolverDecision<T> {
    return {
      value,
      proposedValue: value,
      status: "pending",
      requiresHumanValidation: true,
      justification: reason,
      evidence: [],
      trace: []
    };
  }

  public static failure<T>(justification: string, trace: TraceEntry[] = []): ResolverDecision<T> {
    return {
      status: "pending",
      requiresHumanValidation: true,
      justification,
      evidence: [],
      trace
    };
  }
}
