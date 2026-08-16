import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const source = readFileSync("src/interfaces/lb7/SupplyOfficialTemplateParameterizationScript.ts", "utf8");
const finalization = readFileSync("src/interfaces/lb7/SupplyFinalizationScript.ts", "utf8");

assert.match(source, /7\. Parametrización del Anexo I del DPCAF \/ PCAP oficial/);
assert.match(source, /Anexo I · apartado 1/);
assert.match(source, /Anexo I · apartado 2/);
assert.match(source, /Anexo I · apartado 3/);
assert.match(source, /Anexo I · apartado 7/);
assert.match(source, /Anexo I · apartado 8/);
assert.match(source, /Anexo I · apartado 10/);
assert.match(source, /Anexo I · apartado 14/);
assert.match(source, /No se copiará automáticamente el presupuesto máximo de toda la vigencia/);
assert.match(source, /parámetros de ofertas anormalmente bajas/);
assert.match(source, /no se inferirá/i);
assert.match(finalization, /SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT/);

console.log("lb7-supply-official-template-parameterization: ok");
