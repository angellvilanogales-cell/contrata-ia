import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor,LB94_SUPPLY_GENERAL_RUNTIME_ASSETS} from "../lb94/HttpPersistedTemplateAssetStore";
import {FERRETERIA_MEMORY_TEMPLATE_ID,FERRETERIA_PPT_TEMPLATE_ID} from "../lb59/FerreteriaSourceBackedProtectedRenderers";

const SERVICE_STYLE_V2="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d";

export const LB102_FERRETERIA_SOURCE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:FERRETERIA_MEMORY_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:memoria:v12",sha256:"36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",styleFingerprint:"sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
 {kind:"PPT",templateId:FERRETERIA_PPT_TEMPLATE_ID,sourceId:"real-case:CONTR/2026/240267:ppt:v6",sha256:"c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",styleFingerprint:"sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",provenanceRole:"VALIDATED_REAL_CASE_SOURCE"},
] as const;
export const LB102_FERRETERIA_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,...LB102_FERRETERIA_SOURCE_ASSETS] as const;

/** Reconstrucciones editables derivadas de los tres PDF primarios Panda. Nunca se presentan como ODT fuente original ni como modelo general. */
export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"case:CONTR-2025-466864:pcap:sourcebacked:v5",sourceId:"derived-from-real-case:CONTR-2025-466864:pcap",sha256:"3f087dbeed37e5392d9688ba858d3b7bd29bac1aee112b7a413064473549ab6e",styleFingerprint:"sha256:08a344d87bc5480a332e8cc2b14c9f2e337b000ddff62651a6f6c35ccccc0ba2",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2025-466864:memoria:sourcebacked:v5",sourceId:"derived-from-real-case:CONTR-2025-466864:memoria",sha256:"f6e15af77960cc5bb593af645687c03205889ca310fb6b3db99b759427f78472",styleFingerprint:"sha256:843637a0362ba7936ae17eadff9a334ba8a5637905f7d540162b171e0b8b8671",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2025-466864:ppt:sourcebacked:v5",sourceId:"derived-from-real-case:CONTR-2025-466864:ppt",sha256:"3ac13ae6b42bc02f11f1ca162c681400f52e175f11a0842f6c6d7e717c021593",styleFingerprint:"sha256:f7c6d7b17b63223e356375c0853bb4f5bed57b976b13f8d8db52cf2ef15e84b1",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

/** V2 se conserva como plantilla estructural genérica de desarrollo, pero ya no es la evidencia física de los pilotos UAT. */
export const LB102_SERVICE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V2",sourceId:"source-structural:service:pcap:LB102-V2",sha256:"fe4fd96179c13dfe1ab72150ee17e49190001d2a0920c5040fb8298f94296214",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"contrata-ia:service:memory:strict-pilot:LB102-V2",sourceId:"source-structural:service:memory:LB102-V2",sha256:"540d557e70621f3a041fb193b2f3ddba9543c247e36f4dc45c123a0971d869fe",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V2",sourceId:"source-structural:service:ppt:LB102-V2",sha256:"8e6aa998d71234e4a91ea597f2301ff923248ab8adb5e9b01e83ba60a438e4d1",styleFingerprint:SERVICE_STYLE_V2,provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

/** Reconstrucciones editables página a página desde las tríadas primarias Huelva y Sevilla. */
export const LB102_SERVICE_SOURCEBACKED_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"MEMORIA",templateId:"case:CONTR-2025-468715:memoria:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2025-468715:memoria",sha256:"1716db401f5ce3bba303e772bb2a890a51596e5d412eff6e01258b97a4eaf516",styleFingerprint:"sha256:828e5300d76737ff1945c8db6ff70bf9b32bf4e85e6af45b94e87828e2208af7",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PCAP",templateId:"case:CONTR-2025-468715:pcap:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2025-468715:pcap",sha256:"e9e3431c9ab6182e12c3fa9f540fc25f877e224e492bdb31e42f767d26851eb9",styleFingerprint:"sha256:d9c78e55d16f6febae0c452b3cbfa77b1d92fba7134cd2c9e16e0ea8e81dfd87",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2025-468715:ppt:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2025-468715:ppt",sha256:"022fc552af263741fbde5673933580e2e1e8bdb8a91718b88f5afef06f9a40f8",styleFingerprint:"sha256:1f8e3a9c711962f20bc1a54d46e5c0b5cba1725a808bc71be3b977e40cf62c37",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"MEMORIA",templateId:"case:CONTR-2026-38892:memoria:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2026-38892:memoria",sha256:"34f9694f7e14a1d7b49466c18a652bf022a6b19c9e071b30fe1fb58a826ad97b",styleFingerprint:"sha256:fd364578e0a324372d9bc3a274d3fcd705b329083c4457cc8c664245a727ac9f",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PCAP",templateId:"case:CONTR-2026-38892:pcap:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2026-38892:pcap",sha256:"f0ba727fbb5a2b6cd3d051b60f18c8b362b99c2e90c2bd45a4cd28785f8bed2a",styleFingerprint:"sha256:e009e828a8e9b2983f5e32dd0502bfb1672b8794757f4f3872c5659eb72d8ac9",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
 {kind:"PPT",templateId:"case:CONTR-2026-38892:ppt:sourcebacked:v1",sourceId:"derived-from-real-case:CONTR-2026-38892:ppt",sha256:"63ffd67f80cc7f599a1be2648a954879eacbe867134be269ae3586e1dbe975e2",styleFingerprint:"sha256:906d889bd639546cdf8105d4d0ed2a86636d3e0a9f1cfa0c19566d1068569275",provenanceRole:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"},
] as const;

function env(manifest:readonly PersistedTemplateAssetDescriptor[]){const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return new HttpPersistedTemplateAssetStore(endpoint,token,manifest);}
export function createLB102FerreteriaTemplateStoreFromEnv(){return env(LB102_FERRETERIA_RUNTIME_ASSETS);}
export function createLB102PandaTemplateStoreFromEnv(){return env(LB102_PANDA_ASSETS);}
export function createLB102ServiceTemplateStoreFromEnv(){return env(LB102_SERVICE_ASSETS);}
export function createLB102ServiceSourceBackedTemplateStoreFromEnv(){return env(LB102_SERVICE_SOURCEBACKED_ASSETS);}
