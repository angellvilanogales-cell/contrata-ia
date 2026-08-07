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
import { runLB6Demo, writeLB6DemoArtifacts } from "./application/intake/lb6/LB6Demo";
import { startLB6Server } from "./interfaces/lb6/LB6Server";

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

export function executeLB6IntakeDemo() {
  return runLB6Demo();
}

export function generateLB6DemoFiles(outputDirectory = "artifacts/lb6"): void {
  writeLB6DemoArtifacts(outputDirectory);
}

export async function serveLB6(port?: number): Promise<void> {
  const server = await startLB6Server(port);
  const address = server.address();
  const resolvedPort = typeof address === "object" && address ? address.port : port;
  console.log(JSON.stringify({ status: "listening", url: `http://127.0.0.1:${resolvedPort}` }));
}
