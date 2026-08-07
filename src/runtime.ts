import { runVerticalDemo, type VerticalFlowResult } from "./application/vertical/VerticalSlice";
import {
  runLB4CleaningDemo,
  type LB4CleaningServiceDecision
} from "./application/normative/LB4CleaningServiceEngine";

export async function executeVerticalDemo(): Promise<VerticalFlowResult> {
  return runVerticalDemo();
}

export function executeLB4CleaningDemo(): LB4CleaningServiceDecision {
  return runLB4CleaningDemo();
}
