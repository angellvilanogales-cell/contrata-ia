import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const manifest = [
  ["PCAP", "2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt", "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc"],
  ["MEMORIA", "04_Memoría Ferretería SSCC SAE V12_letrado.odt", "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc"],
  ["PPT", "PPT Feretería SSCC SAE V6.odt", "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09"],
];

const sourceRoot = path.resolve(process.argv[2] ?? "v1-runtime-assets/templates");
const targetRoot = path.resolve(process.argv[3] ?? process.env.CONTRATA_IA_TEMPLATE_DIR ?? "var/contrata-ia/templates");
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

fs.mkdirSync(targetRoot, { recursive: true });
const installed = [];
for (const [kind, fileName, expected] of manifest) {
  const source = path.join(sourceRoot, fileName);
  if (!fs.existsSync(source)) throw new Error(`${kind}: no existe ${source}.`);
  const bytes = fs.readFileSync(source);
  const actual = sha256(bytes);
  if (actual !== expected) throw new Error(`${kind}: SHA-256 incorrecto. Esperado ${expected}; recibido ${actual}.`);
  const target = path.join(targetRoot, fileName);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, bytes, { mode: 0o600 });
  fs.renameSync(tmp, target);
  const installedHash = sha256(fs.readFileSync(target));
  if (installedHash !== expected) throw new Error(`${kind}: fallo de integridad después de instalar el activo.`);
  installed.push({ kind, fileName, sha256: installedHash, target });
}

console.log(JSON.stringify({ ready: true, sourceRoot, targetRoot, installed }, null, 2));
