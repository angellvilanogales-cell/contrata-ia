import { HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor } from "../lb94/HttpPersistedTemplateAssetStore";
import { WORKS_CONCESSION_GENERAL_TEMPLATE_MANIFEST } from "./WorksConcessionGeneralTemplateManifest";

export const LB98_WORKS_CONCESSION_RUNTIME_ASSETS:readonly PersistedTemplateAssetDescriptor[]=WORKS_CONCESSION_GENERAL_TEMPLATE_MANIFEST.map(item=>({kind:item.kind==="MEMORY"?"MEMORIA":item.kind,templateId:item.templateId,sourceId:item.templateId,sha256:item.expectedSha256,styleFingerprint:item.expectedStyleFingerprint,provenanceRole:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE"})) as readonly PersistedTemplateAssetDescriptor[];
export function createHttpPersistedWorksConcessionTemplateAssetStore(endpoint:string,token:string){return new HttpPersistedTemplateAssetStore(endpoint,token,LB98_WORKS_CONCESSION_RUNTIME_ASSETS);}
export function createHttpPersistedWorksConcessionTemplateAssetStoreFromEnv(){const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return createHttpPersistedWorksConcessionTemplateAssetStore(endpoint,token);}
