import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync("src/interfaces/lb7/SupplyAwardCriteriaVisibilityHotfixScript.ts", "utf8");

test("el hotfix de criterios no usa MutationObserver autorreferente", () => {
  assert.equal(source.includes("new MutationObserver"), false);
});

test("reconstruye 5.1 cuando el cierre económico ya está validado", () => {
  assert.match(source, /5\.1 Cierre jurídico-económico/);
  assert.match(source, /ensureClosure/);
  assert.match(source, /supplyEstimatedValueValidated/);
});

test("5.2 se inserta después del 5.1 cuando este existe", () => {
  assert.match(source, /closure\.insertAdjacentHTML\("afterend",html\)/);
  assert.match(source, /5\.2 Control jurídico de los criterios de adjudicación/);
});

test("el mapeo no mantiene precio único como cerrado durante el conflicto", () => {
  assert.match(source, /configuración reabierta por control jurídico/);
  assert.match(source, /Precio como criterio único: revisión jurídica requerida/);
});
