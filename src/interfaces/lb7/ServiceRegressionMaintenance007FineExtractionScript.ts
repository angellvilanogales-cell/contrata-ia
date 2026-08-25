import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "../../regression/ServiceRegressionCase007MaintenanceSevilleFineExtraction";
import { SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT } from "./ServiceRegressionMaintenance007GuardScript";

const CASE_JSON = JSON.stringify(SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE);

const MAINTENANCE_007_FINE_EXTRACTION_CORE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SERVICE-007-MAINTENANCE-SEVILLE-FINE-11.9.1-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"maintenance-fine-evidence-11.9.1"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function manifest(validated){return {version:VERSION,id:CASE.id,step:CASE.step,expediente:CASE.expediente,status:validated?"FINE_EVIDENCE_ENVELOPE_HUMAN_VALIDATED_WITH_BLOCKING_SOURCE_INCONSISTENCY":CASE.status,confirmed:CASE.confirmed,blockedBySourceInconsistency:CASE.blockedBySourceInconsistency,pendingPrimaryEvidence:CASE.pendingPrimaryEvidence,evidencePolicy:CASE.evidencePolicy,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-007_Mantenimiento-Sevilla_Fine_11-9-1.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,status){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(status)+'</td></tr>';}
function card(){var a=readAnswers();if(a.serviceRegressionMaintenance007ExtractionValidated!==true)return "";var c=CASE.confirmed,b=CASE.blockedBySourceInconsistency,validated=a.serviceRegressionMaintenance007FineExtractionValidated===true;var html='<div id="serviceRegressionMaintenance007FineExtractionCard" class="card" style="margin-top:14px"><h3>11.9.1 Extracción documental fina · Mantenimiento SAE Sevilla</h3><div class="info"><strong>Sobre de evidencia fina.</strong> Este paso solo congela hechos ya respaldados por Memoria + PCAP + PPT. Los campos económicos y jurídicos que no se han recuperado de forma expresa permanecen pendientes y no se heredan del CARL ni de los suministros.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Extremo</th><th>Valor</th><th>Estado</th></tr></thead><tbody>';
html+=row("Tipo",c.contractType,"CONFIRMADO");
html+=row("Procedimiento","Abierto · SARA","CONFIRMADO");
html+=row("Lotes","4","CONFIRMADO");
html+=row("Lote 1",c.lotNames[0],"CONFIRMADO");
html+=row("Lote 2",c.lotNames[1],"CONFIRMADO");
html+=row("Lote 3",c.lotNames[2],"CONFIRMADO");
html+=row("Lote 4",c.lotNames[3],"CONFIRMADO");
html+=row("CPV",c.cpvs.join(", "),"CONFIRMADO");
html+=row("Insuficiencia de medios propios","Sí","CONFIRMADO");
html+=row("GMAO como medio técnico","Sí","CONFIRMADO");
html+=row("Límite de lotes por licitador","NO CONGELABLE","BLOQUEADO POR CONTRADICCIÓN DE FUENTE");
html+='</tbody></table><div class="warning"><strong>Contradicción que permanece abierta.</strong> '+esc(b.statementA)+' / '+esc(b.statementB)+' La aplicación no decide cuál prevalece. Requiere revisión del documento original o aclaración del órgano de contratación.</div><div class="warning"><strong>Pendiente de fuente primaria:</strong><ul>'+CASE.pendingPrimaryEvidence.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div><div class="warning"><strong>Regla de seguridad documental.</strong> Un campo pendiente no puede rellenarse con datos del CARL, del golden de suministro ni mediante heurísticas de prevalencia documental.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción fina pendiente de validación humana, con 1 contradicción bloqueante para congelación de la regla de lotes.</p><button id="validateMaintenance007FineExtraction" type="button">Validar extracción documental 11.9.1</button>';}else{html+='<div class="info"><strong>11.9.1 validado.</strong> Se congela el perímetro acreditado y se conserva expresamente la contradicción de lotes como bloqueo. REG-SERVICE-007 todavía no es línea base documental completa ni golden case.</div><button id="downloadMaintenance007FineExtraction" type="button" class="secondary">Descargar extracción 11.9.1 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionMaintenance007FineExtractionCard");if(old)old.remove();var anchor=document.getElementById("serviceRegressionMaintenance007ExtractionCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateMaintenance007FineExtraction"){var a=readAnswers();if(a.serviceRegressionMaintenance007ExtractionValidated!==true){alert("Primero debe validarse la extracción documental 11.9.");return;}var m=manifest(true);a.serviceRegressionMaintenance007FineExtractionValidated=true;a.serviceRegressionMaintenance007FineExtractionVersion=VERSION;a.serviceRegressionMaintenance007FineExtractionManifest=m;a.serviceRegressionMaintenance007FineStatus="FINE_EVIDENCE_ENVELOPE_HUMAN_VALIDATED_WITH_BLOCKING_SOURCE_INCONSISTENCY";a.serviceRegressionNextRecommendedStep="11.9.2";save(a);downloadJson(m);ensure();alert("Extracción fina 11.9.1 validada. La contradicción del límite de lotes continúa bloqueada y no se ha resuelto por inferencia.");return;}if(e.target.id==="downloadMaintenance007FineExtraction"){var a2=readAnswers();downloadJson(a2.serviceRegressionMaintenance007FineExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;

export const SERVICE_REGRESSION_MAINTENANCE_007_FINE_EXTRACTION_SCRIPT = MAINTENANCE_007_FINE_EXTRACTION_CORE_SCRIPT + "\n" + SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT;
