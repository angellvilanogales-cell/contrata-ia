import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor,LB94_SUPPLY_GENERAL_RUNTIME_ASSETS} from "../lb94/HttpPersistedTemplateAssetStore";
import {FERRETERIA_MEMORY_TEMPLATE_ID,FERRETERIA_PPT_TEMPLATE_ID} from "../lb59/FerreteriaSourceBackedProtectedRenderers";

const SERVICE_STYLE_V2="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d";

export const LB102_FERRETERIA_SOURCE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:FERRETERIA_MEMORY_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:memoria:v12",sha256:"36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",styleFingerprint:"sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"PPT",templateId:FERRETERIA_PPT_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:ppt:v6",sha256:"c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",styleFingerprint:"sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
] as const;
export const LB102_FERRETERIA_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,...LB102_FERRETERIA_SOURCE_ASSETS] as const;

/** Fuentes físicas Panda reconstruidas página a página desde los tres PDF primarios. Solo regresión/piloto; nunca modelo general. */
export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"case:CONTR-2025-466864:pcap:sourcebacked:v4",sourceId:"real-case:CONTR-2025-466864:pcap",sha256:"cd0db26dafd16179f8e11f4a8ef552f21c6cd52917b20ee6d039c7ccd0026856",styleFingerprint:"sha256:f99ddf44c0f09388f25d98faa0028df048fee9b2c15bb57f31e92ffe89021655",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2025-466864:memoria:sourcebacked:v4",sourceId:"real-case:CONTR-2025-466864:memoria",sha256:"e4213c2f3cc31d4948b0615158f8e256198bf75080b6db66494e04daf13d4090",styleFingerprint:"sha256:0143d7c929be14bc372188e371c72de1fafed589b313501dfee48aee32361971",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
 {kind:"PPT",templateId:"case:CONTR-2025-466864:ppt:sourcebacked:v4",sourceId:"real-case:CONTR-2025-466864:ppt",sha256:"74ab3bed8157ce382ffd09e620c385e8200bee9398c6203e696f345104d2dfff",styleFingerprint:"sha256:d263f9a1da846e11ee9edad4f13b4e3ffd1571dc153ee019f747fb4c41c1f7eb",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
] as const;
export const LB102_SERVICE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V2",sourceId:"source-structural:service:pcap:LB102-V2",sha256:"fe4fd96179c13dfe1ab72150ee17e49190001d2a0920c5040fb8298f94296214",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"contrata-ia:service:memory:strict-pilot:LB102-V2",sourceId:"source-structural:service:memory:LB102-V2",sha256:"540d557e70621f3a041fb193b2f3ddba9543c247e36f4dc45c123a0971d869fe",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V2",sourceId:"source-structural:service:ppt:LB102-V2",sha256:"8e6aa998d71234e4a91ea597f2301ff923248ab8adb5e9b01e83ba60a438e4d1",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;
function env(manifest:readonly PersistedTemplateAssetDescriptor[]){const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return new HttpPersistedTemplateAssetStore(endpoint,token,manifest);}
export function createLB102FerreteriaTemplateStoreFromEnv(){return env(LB102_FERRETERIA_RUNTIME_ASSETS);}
export function createLB102PandaTemplateStoreFromEnv(){return env(LB102_PANDA_ASSETS);}
export function createLB102ServiceTemplateStoreFromEnv(){return env(LB102_SERVICE_ASSETS);}
