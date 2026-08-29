import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor} from "../lb94/HttpPersistedTemplateAssetStore";

const PANDA_STYLE="sha256:049071c575580cb7080b5f9c530523e2c3160bec87902205592c36225cc67064";
const SERVICE_STYLE="sha256:ab69d4c2e87c1873c2bb3ccba87132e931ef0fff85273b1313df4245b50f002a";

export const LB102_PANDA_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"contrata-ia:supply:pcap:aso:autofinanced:LB102-V1",sourceId:"contrata-ia:supply:pcap:aso:autofinanced:LB102-V1",sha256:"7559603d593b3845f27dbff17b7ba8d1150c2cf2844205c1999ceed69dbeaa90",styleFingerprint:PANDA_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_PROCEDURE_TEMPLATE"},
 {kind:"MEMORIA",templateId:"contrata-ia:supply:memory:aso:software:LB102-V1",sourceId:"contrata-ia:supply:memory:aso:software:LB102-V1",sha256:"c69f3a25bf8051e3ac60898b3f4efb2f4e299ad46a0a5566da88027669efb05c",styleFingerprint:PANDA_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_SUBFAMILY_TEMPLATE"},
 {kind:"PPT",templateId:"contrata-ia:supply:ppt:aso:software:LB102-V1",sourceId:"contrata-ia:supply:ppt:aso:software:LB102-V1",sha256:"bd9e7c31f6705ba23815b127e09185eefb6dc4685990daaa32a1407c16b15264",styleFingerprint:PANDA_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_SUBFAMILY_TEMPLATE"},
] as const;
export const LB102_SERVICE_ASSETS:readonly PersistedTemplateAssetDescriptor[]=[
 {kind:"PCAP",templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V1",sourceId:"contrata-ia:service:pcap:strict-pilot:LB102-V1",sha256:"d2ee1cc5d99660b2486bfb4b4e1cd3992bed36ae298ff5bbc9663869a4f66299",styleFingerprint:SERVICE_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_STRICT_PILOT_TEMPLATE"},
 {kind:"MEMORIA",templateId:"contrata-ia:service:memory:strict-pilot:LB102-V1",sourceId:"contrata-ia:service:memory:strict-pilot:LB102-V1",sha256:"5bd6d1f046e340a69e7b15a9ea8cdd88cb2b0ead4bfeaa0221aedbcc951eb774",styleFingerprint:SERVICE_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_STRICT_PILOT_TEMPLATE"},
 {kind:"PPT",templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V1",sourceId:"contrata-ia:service:ppt:strict-pilot:LB102-V1",sha256:"c3d646a4e1c986c73d463c0a8de908a67e3f16f7581fe0bc1f400ef8b5248115",styleFingerprint:SERVICE_STYLE,provenanceRole:"CONTRATA_IA_DERIVED_STRICT_PILOT_TEMPLATE"},
] as const;
function env(manifest:readonly PersistedTemplateAssetDescriptor[]){const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return new HttpPersistedTemplateAssetStore(endpoint,token,manifest);}
export function createLB102PandaTemplateStoreFromEnv(){return env(LB102_PANDA_ASSETS);}
export function createLB102ServiceTemplateStoreFromEnv(){return env(LB102_SERVICE_ASSETS);}
