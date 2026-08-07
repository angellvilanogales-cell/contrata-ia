export interface CPV {
  code: string;
  description?: string;
  source?: string;
  validated?: boolean;
}

/** Canonical scalar representation used by ContractContext. */
export type CPVCode = string;
