import { evaluateFerreteriaPcapFinalClosure } from "../lb46/FerreteriaPcapFinalDocumentClosure";
import { evaluateFerreteriaMemoryFinalClosure } from "../lb47/FerreteriaMemoryFinalDocumentClosure";
import { evaluateFerreteriaPptFinalClosure } from "../lb48/FerreteriaPptFinalDocumentClosure";

/** LB49 — puerta conjunta PCAP + Memoria + PPT. */
export function evaluateFerreteriaThreeDocumentClosureGate() {
  const pcap=evaluateFerreteriaPcapFinalClosure();
  const memory=evaluateFerreteriaMemoryFinalClosure();
  const ppt=evaluateFerreteriaPptFinalClosure();
  const blockers=[...pcap.blockers.map(x=>`PCAP: ${x}`), ...memory.blockers.map(x=>`MEMORIA: ${x}`), ...ppt.blockers.map(x=>`PPT: ${x}`)];
  return {
    engineeringClosed: pcap.engineeringClosed && memory.engineeringClosed && ppt.engineeringClosed && blockers.length===0,
    documents: { pcap, memory, ppt },
    blockers,
    humanAcceptanceRequired: true,
    runtimeOfficialAssetsStillRequiredForProduction: true,
    productionReady: false,
  } as const;
}
