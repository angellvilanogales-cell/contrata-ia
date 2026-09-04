import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor,LB94_SUPPLY_GENERAL_RUNTIME_ASSETS} from "../lb94/HttpPersistedTemplateAssetStore";

const SERVICE_STYLE_V2="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d";

export const FERRETERIA_POST_INTERVENCION_PCAP_TEMPLATE_ID="case:CONTR-2026-240267:pcap:v8:post-intervencion:editable" as const;
export const FERRETERIA_POST_INTERVENCION_MEMORY_TEMPLATE_ID="case:CONTR-2026-240267:memoria:v14:post-intervencion:editable" as const;
export const FERRETERIA_POST_INTERVENCION_PPT_TEMPLATE_ID="case:CONTR-2026-240267:ppt:v8:post-intervencion:editable" as const;
export const PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID="JDA-PCAP-SUPPLY-ASO-AUTOFINANCED-2025-12-17" as const;
export const PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL="https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_ordinario_autofinanciada.odt" as const;

/** Tríada editable post-Intervención corregida y humanamente validada el 02/09/2026. No es modelo general. */
export const LB102_FERRETERIA_SOURCE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:FERRETERIA_POST_INTERVENCION_PCAP_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:pcap:v8:post-intervencion:human-validated-corrected",sha256:"9c5cdc5b42238c44994e1fc68759c3433a8fe8a84238da8efe113af73edf3a82",styleFingerprint:"sha256:e8dea86fa199b0fcd330445c9cca988da816caea17a8498cecce2f5da2411bb3",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"MEMORIA",templateId:FERRETERIA_POST_INTERVENCION_MEMORY_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:memoria:v14:post-intervencion:human-validated-corrected",sha256:"b10930e825c9fadc574e0e008a07b05746541415aa050bdc42f91dff257ca1c0",styleFingerprint:"sha256:8e7db289d312e786782fb278ef9d4b3d1e41f2425c419f10f5c3ff4113228065",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"PPT",templateId:FERRETERIA_POST_INTERVENCION_PPT_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:ppt:v8:post-intervencion:human-validated-corrected",sha256:"b36ec94e4107c4d95fdb6465c4f46909eb806c49411c90e7fccf9dd288782212",styleFingerprint:"sha256:a483412113912881741809575db2361a627b34647d1a94992384572ab87407d0",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
] as const;
export const LB102_FERRETERIA_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,...LB102_FERRETERIA_SOURCE_ASSETS] as const;

/** Reconstrucciones editables V8 derivadas de los PDF primarios Panda. En V10 PCAP solo sirve como evidencia del caso, nunca como plantilla de salida. */
export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"case:CONTR-2025-466864:pcap:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:pcap:v8",sha256:"bd3d90907ccb9ca108e44dcf2dfb8562b7aef5603ffa26e44d229218b11653af",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2025-466864:memoria:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:memoria:v8",sha256:"5f6c72fcf1b5d016867f886f805c3217ca3e27c82b0a9ecdd5a32d5ac005d553",styleFingerprint:"sha256:55c0b5a9f5f123f3e444efb6c3106be193bde30d23ef087bdfcc5d1f9d7623a4",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2025-466864:ppt:sourcebacked:v8",sourceId:"derived-from-real-case:CONTR-2025-466864:ppt:v8",sha256:"5d1a46369ae202287352d7bb79fd584807e370775fd8dc007367337027c6a25c",styleFingerprint:"sha256:5e15f66b9d11748f2e10b40d0bf9554fd0fcce738b7cb31c99671f6fd1da9072",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

export function lb102PandaOfficialAsoPcapAsset():PersistedTemplateAssetDescriptor|null{
 const sha256=process.env.CONTRATA_IA_JDA_PCAP_SUPPLY_ASO_SHA256?.trim().toLowerCase();
 const styleFingerprint=process.env.CONTRATA_IA_JDA_PCAP_SUPPLY_ASO_STYLE_FINGERPRINT?.trim();
 if(!sha256&&!styleFingerprint)return null;
 if(!sha256||!/^[a-f0-9]{64}$/.test(sha256))throw new Error("CONTRATA_IA_JDA_PCAP_SUPPLY_ASO_SHA256 debe contener el SHA-256 acreditado del modelo oficial ASO.");
 if(!styleFingerprint||!/^sha256:[a-f0-9]{64}$/.test(styleFingerprint))throw new Error("CONTRATA_IA_JDA_PCAP_SUPPLY_ASO_STYLE_FINGERPRINT debe contener la huella de estilo acreditada del modelo oficial ASO.");
 return{kind:"PCAP",templateId:PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID,sourceId:"jda:cccp:pcap:supply:aso:autofinanced:2025-12-17:odt",sha256,styleFingerprint,provenanceRole:"OFFICIAL_MODEL"};
}
export function lb102PandaOfficialAsoPcapConfigured(){return Boolean(lb102PandaOfficialAsoPcapAsset());}
export function lb102PandaRuntimeAssets():readonly PersistedTemplateAssetDescriptor[]{const official=lb102PandaOfficialAsoPcapAsset();return official?[...LB102_PANDA_ASSETS,official]:LB102_PANDA_ASSETS;}

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
export function createLB102PandaTemplateStoreFromEnv(){return env(lb102PandaRuntimeAssets());}
export function createLB102ServiceTemplateStoreFromEnv(){return env(LB102_SERVICE_ASSETS);}
export function createLB102ServiceSourceBackedTemplateStoreFromEnv(){return env(LB102_SERVICE_SOURCEBACKED_ASSETS);}
