import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor,LB94_SUPPLY_GENERAL_RUNTIME_ASSETS} from "../lb94/HttpPersistedTemplateAssetStore";
import {FERRETERIA_MEMORY_TEMPLATE_ID,FERRETERIA_PPT_TEMPLATE_ID} from "../lb59/FerreteriaSourceBackedProtectedRenderers";

const SERVICE_STYLE_V2="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d";

export const LB102_FERRETERIA_SOURCE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:FERRETERIA_MEMORY_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:memoria:v12",sha256:"36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",styleFingerprint:"sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"PPT",templateId:FERRETERIA_PPT_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:ppt:v6",sha256:"c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",styleFingerprint:"sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
] as const;
export const LB102_FERRETERIA_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,...LB102_FERRETERIA_SOURCE_ASSETS] as const;

/** Fuentes físicas Panda del caso real, solo para regresión/piloto: nunca modelo general. */
export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"case:CONTR-2025-466864:pcap:sourcebacked:v3",sourceId:"real-case:CONTR-2025-466864:pcap",sha256:"13002bbd23c72d018e4b2b35e681fe3c4bfc60f73fe9161cd409f89b56e4fb44",styleFingerprint:"sha256:02c21a4cdf0b1f7164d7e7c4f07424738bd3beaf1d63a8cb7aa1f9c82e2e72a6",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2025-466864:memoria:sourcebacked:v3",sourceId:"real-case:CONTR-2025-466864:memoria",sha256:"89458ac89c41d16d4390b0fcd43768b24138ff70ef93746b2529417a97ed4f2e",styleFingerprint:"sha256:7acb8c38538746aff67afc9ebc197d913038fe271c1ffba385476f80bb6271a7",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
 {kind:"PPT",templateId:"case:CONTR-2025-466864:ppt:sourcebacked:v3",sourceId:"real-case:CONTR-2025-466864:ppt",sha256:"f0add66d3219c35e28bb55f7bb884f01ca70c677b42fb1d666eda62ee1c9cbaf",styleFingerprint:"sha256:c3214d23737893fa2581c6cafcb347807022eaabc363fcd68038fc5f978f387e",provenanceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE"},
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
