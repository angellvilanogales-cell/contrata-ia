import { runVerticalDemo, type VerticalFlowResult } from "./application/vertical/VerticalSlice";
import {
  runLB4CleaningDemo,
  type LB4CleaningServiceDecision
} from "./application/normative/LB4CleaningServiceEngine";
import {
  runLB5Demo,
  writeLB5DemoArtifacts
} from "./application/documents/lb5/LB5Demo";
import type { LB5RenderedPackage } from "./application/documents/lb5/DocumentModel";

export async function executeVerticalDemo(): Promise<VerticalFlowResult> {
  return runVerticalDemo();
}

export function executeLB4CleaningDemo(): LB4CleaningServiceDecision {
  return runLB4CleaningDemo();
}

export function executeLB5DocumentDemo(): LB5RenderedPackage {
  return runLB5Demo();
}

export function generateLB5DemoFiles(outputDirectory = "artifacts/lb5"): LB5RenderedPackage {
  return writeLB5DemoArtifacts(outputDirectory);
}
