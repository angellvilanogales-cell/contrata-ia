import type { ContractType } from "./ContractType";
import type { CPV } from "./CPV";

export interface ContractFile {
  id?: string;
  type?: ContractType | string;
  cpv?: CPV | CPV[] | string | string[];
  estimatedValue?: number;
  budget?: number;
  price?: number;
  duration?: number;
  lots?: unknown;
  [key: string]: unknown;
}
