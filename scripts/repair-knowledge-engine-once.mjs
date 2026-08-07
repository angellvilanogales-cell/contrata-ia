import fs from "node:fs";
import { execFileSync } from "node:child_process";

const file = "src/domain/conocimiento/KnowledgeEngine.ts";
const source = fs.readFileSync(file, "utf8");
const classPos = source.indexOf("export class KnowledgeEngine");
if (classPos < 0) throw new Error("KnowledgeEngine class not found");
const classOpen = source.indexOf("{", classPos);
if (classOpen < 0) throw new Error("KnowledgeEngine opening brace not found");

function declarationEnd(text, openingBrace) {
  let depth = 0;
  let state = "code";
  for (let i = openingBrace; i < text.length; i += 1) {
    const c = text[i];
    const n = text[i + 1];
    if (state === "code") {
      if (c === "/" && n === "*") { state = "block"; i += 1; continue; }
      if (c === "/" && n === "/") { state = "line"; i += 1; continue; }
      if (c === '"') { state = "double"; continue; }
      if (c === "'") { state = "single"; continue; }
      if (c === "`") { state = "template"; continue; }
      if (c === "{") depth += 1;
      if (c === "}") {
        depth -= 1;
        if (depth === 0) return i + 1;
      }
    } else if (state === "block") {
      if (c === "*" && n === "/") { state = "code"; i += 1; }
    } else if (state === "line") {
      if (c === "\n") state = "code";
    } else if (state === "double") {
      if (c === "\\") i += 1;
      else if (c === '"') state = "code";
    } else if (state === "single") {
      if (c === "\\") i += 1;
      else if (c === "'") state = "code";
    } else if (state === "template") {
      if (c === "\\") i += 1;
      else if (c === "`") state = "code";
    }
  }
  throw new Error("Unclosed declaration");
}

function depthAt(text, start, end) {
  let depth = 0;
  let state = "code";
  for (let i = start; i < end; i += 1) {
    const c = text[i];
    const n = text[i + 1];
    if (state === "code") {
      if (c === "/" && n === "*") { state = "block"; i += 1; continue; }
      if (c === "/" && n === "/") { state = "line"; i += 1; continue; }
      if (c === '"') { state = "double"; continue; }
      if (c === "'") { state = "single"; continue; }
      if (c === "`") { state = "template"; continue; }
      if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
    } else if (state === "block") {
      if (c === "*" && n === "/") { state = "code"; i += 1; }
    } else if (state === "line") {
      if (c === "\n") state = "code";
    } else if (state === "double") {
      if (c === "\\") i += 1;
      else if (c === '"') state = "code";
    } else if (state === "single") {
      if (c === "\\") i += 1;
      else if (c === "'") state = "code";
    } else if (state === "template") {
      if (c === "\\") i += 1;
      else if (c === "`") state = "code";
    }
  }
  return depth;
}

const declarationPattern = /export\s+(interface|enum|type)\s+[A-Za-z_$][\w$]*/g;
const declarations = [];
let match;
while ((match = declarationPattern.exec(source)) !== null) {
  if (match.index <= classOpen) continue;
  const openingBrace = source.indexOf("{", match.index);
  if (openingBrace < 0) throw new Error(`Missing opening brace for declaration at ${match.index}`);
  const end = declarationEnd(source, openingBrace);
  if (depthAt(source, classOpen + 1, match.index) === 1) {
    declarations.push({ start: match.index, end, text: source.slice(match.index, end) });
  }
}

if (declarations.length === 0) {
  throw new Error("No exported declarations nested directly inside KnowledgeEngine were found");
}

let repaired = source;
for (const declaration of [...declarations].sort((a, b) => b.start - a.start)) {
  repaired = repaired.slice(0, declaration.start) + repaired.slice(declaration.end);
}
const declarationsText = declarations.map((d) => d.text.trim()).join("\n\n");
repaired = repaired.slice(0, classPos) + declarationsText + "\n\n" + repaired.slice(classPos);
fs.writeFileSync(file, repaired);

execFileSync("git", ["diff", "--check"], { stdio: "inherit" });
console.log(`Recovered ${declarations.length} exported declarations from inside KnowledgeEngine.`);
