#!/usr/bin/env node

import process from "node:process";
import { createLB96RuntimeServer } from "../dist/interfaces/lb96/LB96RuntimeServer.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

if (process.env.NODE_ENV !== "production") {
  console.warn("[Contrata-IA] Arranque piloto sin NODE_ENV=production. Para un piloto HTTPS real use NODE_ENV=production y credenciales configuradas.");
}

const server = createLB96RuntimeServer();
server.once("error", error => {
  console.error(error);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`[Contrata-IA] Piloto LB96 escuchando en ${host}:${port}. TLS debe terminar en el proxy/plataforma HTTPS.`);
});
