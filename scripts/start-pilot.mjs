#!/usr/bin/env node

import process from "node:process";
import { startLB103AuthoritativeServer } from "../dist/interfaces/lb103/LB103AuthoritativeServer.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

if (process.env.NODE_ENV !== "production") {
  console.warn("[Contrata-IA] Arranque piloto sin NODE_ENV=production. Para un piloto HTTPS real use NODE_ENV=production y credenciales configuradas.");
}

try {
  await startLB103AuthoritativeServer(port, host);
  console.log(`[Contrata-IA] Runtime LB103 autoritativo sobre LB102 escuchando en ${host}:${port}. TLS debe terminar en el proxy/plataforma HTTPS.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
