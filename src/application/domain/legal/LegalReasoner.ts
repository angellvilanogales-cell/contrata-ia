import { LegalReasoner as CanonicalLegalReasoner } from "../../../domain/legal/LegalReasoner";
import { ContractContextModel } from "../../../application/modules/contract-generator/ContractContext";

export class LegalReasoner extends CanonicalLegalReasoner {
  public async execute(context: ContractContextModel): Promise<void> {
    this.initialize(context);
  }
}
