import manifest from "./canonical-manifest.json";
import type {
  CanonicalArchitectureSnapshot,
  CanonicalComponentDescriptor,
  CanonicalComponentId
} from "./contracts";

const COMPONENT_IDS: readonly CanonicalComponentId[] = [
  "configuration",
  "events",
  "rules",
  "inference",
  "knowledge",
  "legalReasoning",
  "cpv",
  "procedure",
  "documents",
  "export",
  "ai"
];

function isCanonicalComponentId(value: string): value is CanonicalComponentId {
  return (COMPONENT_IDS as readonly string[]).includes(value);
}

function descriptorOf(component: (typeof manifest.components)[number]): CanonicalComponentDescriptor {
  if (!isCanonicalComponentId(component.id)) {
    throw new Error(`Unknown canonical component id: ${component.id}`);
  }

  return Object.freeze({
    id: component.id,
    contract: component.contract,
    canonicalPath: component.canonicalPath,
    legacyPaths: Object.freeze([...component.legacyPaths])
  });
}

const snapshot: CanonicalArchitectureSnapshot = Object.freeze({
  architectureVersion: manifest.architectureVersion,
  runtimeEntrypoint: manifest.runtimeEntrypoint,
  components: Object.freeze(manifest.components.map(descriptorOf))
});

export function getCanonicalArchitecture(): CanonicalArchitectureSnapshot {
  return snapshot;
}

export function getCanonicalComponent(id: CanonicalComponentId): CanonicalComponentDescriptor {
  const component = snapshot.components.find(candidate => candidate.id === id);
  if (!component) {
    throw new Error(`Canonical component not registered: ${id}`);
  }
  return component;
}
