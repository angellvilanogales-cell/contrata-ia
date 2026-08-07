export interface CostEstimateInput {
  estimatedValue?: number;
  durationMonths?: number;
}

export interface CostEstimate {
  value?: number;
  currency: "EUR";
  basis: "provided_estimated_value" | "not_available";
}

export class CostEstimator {
  public estimate(input: CostEstimateInput): CostEstimate {
    if (typeof input.estimatedValue === "number" && Number.isFinite(input.estimatedValue) && input.estimatedValue >= 0) {
      return { value: input.estimatedValue, currency: "EUR", basis: "provided_estimated_value" };
    }
    return { currency: "EUR", basis: "not_available" };
  }
}
