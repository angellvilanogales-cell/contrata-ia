import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor,LB94_SUPPLY_GENERAL_RUNTIME_ASSETS} from "../lb94/HttpPersistedTemplateAssetStore";
import {FERRETERIA_MEMORY_TEMPLATE_ID,FERRETERIA_PPT_TEMPLATE_ID} from "../lb59/FerreteriaSourceBackedProtectedRenderers";

const SERVICE_STYLE_V2="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d";

export const LB102_FERRETERIA_SOURCE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:FERRETERIA_MEMORY_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:memoria:v12",sha256:"36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",styleFingerprint:"sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"PPT",templateId:FERRETERIA_PPT_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:ppt:v6",sha256:"c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",styleFingerprint:"sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
] as const;
export const LB102_FERRETERIA_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,...LB102_FERRETERIA_SOURCE_ASSETS] as const;

/** Reconstrucciones editables V8 derivadas de los tres PDF primarios Panda. Nunca se presentan como ODT fuente original ni como modelo general. */
export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"case:CONTR-2025-466864:pcap:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:pcap:v8",sha256:"bd3d90907ccb9ca108e44dcf2dfb8562b7aef5603ffa26e44d229218b11653af",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2025-466864:memoria:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:memoria:v8",sha256:"5f6c72fcf1b5d016867f886f805c3217ca3e27c82b0a9ecdd5a32d5ac005d553",styleFingerprint:"sha256:55c0b5a9f5f123f3e444efb6c3106be193bde30d23ef087bdfcc5d1f9d7623a4",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2025-466864:ppt:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:ppt:v8",sha256:"5d1a46369ae202287352d7bb79fd584807e370775fd8dc007367337027c6a25c",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

/** V2 se conserva como plantilla estructural genérica de desarrollo, pero ya no es la evidencia física de los pilotos UAT. */
export const LB102_SERVICE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V2",sourceId:"source-structural:service:pcap:LB102-V2",sha256:"fe4fd96179c13dfe1ab72150ee17e49190001d2a0920c5040fb8298f94296214",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"contrata-ia:service:memory:strict-pilot:LB102-V2",sourceId:"source-structural:service:memory:LB102-V2",sha256:"540d557e70621f3a041fb193b2f3ddba9543c247e36f4dc45c123a0971d869fe",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V2",sourceId:"source-structural:service:ppt:LB102-V2",sha256:"8e6aa998d71234e4a91ea597f2301ff923248ab8adb5e9b01e83ba60a438e4d1",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

/** Reconstrucciones editables V8 página a página desde las tríadas primarias Huelva y Sevilla. */
export const LB102_SERVICE_SOURCEBACKED_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:"case:CONTR-2025-468715:memoria:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-468715:memoria:v8",sha256:"afd43ac701e4e01a0f7419e8c693fea19c103a008eeaa4874eeb903089ac58e0",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PCAP",templateId:"case:CONTR-2025-468715:pcap:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-468715:pcap:v8",sha256:"bb03174f8834c3d47f0da953b034c01b93c31b7bc8c1cc2eaf42c26cea5f690b",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2025-468715:ppt:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-468715:ppt:v8",sha256:"92c8c62b4f24fc62975b212931888c30cfda73094da820c8bd86935e62807bc2",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2026-38892:memoria:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2026-38892:memoria:v8",sha256:"44351438828c1080afafc2036f49a00dd62b8ca03716e24132a8d87c3cdb807a",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PCAP",templateId:"case:CONTR-2026-38892:pcap:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2026-38892:pcap:v8",sha256:"09c2e474755cd15a3e457b566ea19b0d8342636d81095c6bec1d32bee5c16c9f",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2026-38892:ppt:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2026-38892:ppt:v8",sha256:"3f6ba7161fc2864e1b50c4d9ac9784f8639685f0c8e1ae6f6ce9e9e6bd5a34c7",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

function env(manifest:readonly PersistedTemplateAssetDescriptor[]){const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return new HttpPersistedTemplateAssetStore(endpoint,token,manifest);}
export function createLB102FerreteriaTemplateStoreFromEnv(){return env(LB102_FERRETERIA_RUNTIME_ASSETS);}
export function createLB102PandaTemplateStoreFromEnv(){return env(LB102_PANDA_ASSETS);}
export function createLB102ServiceTemplateStoreFromEnv(){return env(LB102_SERVICE_ASSETS);}
export function createLB102ServiceSourceBackedTemplateStoreFromEnv(){return env(LB102_SERVICE_SOURCEBACKED_ASSETS);}
