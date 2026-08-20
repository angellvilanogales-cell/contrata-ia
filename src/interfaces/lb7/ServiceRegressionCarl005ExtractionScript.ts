import { SERVICE_REGRESSION_CASE_005_CARL_CLEANING } from "../../regression/ServiceRegressionCase005CarlCleaning";

const CASE_JSON = JSON.stringify(SERVICE_REGRESSION_CASE_005_CARL_CLEANING);

export const SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SERVICE-005-CARL-EXTRACTION-11.8-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"carl-service-extraction-11.8"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,contrastWithSupplyCases:CASE.contrastWithSupplyCases,regressionGuards:CASE.regressionGuards,extractionScope:CASE.extractionScope,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-005_CARL_11-8.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.supplyRegressionVeiasa006AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.serviceRegressionCarl005ExtractionValidated===true;var html='<div id="serviceRegressionCarl005ExtractionCard" class="card" style="margin-top:14px"><h3>11.8 REG-SERVICE-005 · Limpieza sede CARL</h3><div class="info"><strong>Apertura real de cobertura a servicios.</strong> La extracción se apoya en Memoria + PCAP + PPT del expediente ADM-2024-0004 (CONTR/2024/636510). Solo se fijan los hechos expresamente identificados; no se trasladan por defecto reglas de suministros.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>CARL limpieza</th><th>Contraste con suministros</th></tr></thead><tbody>';
html+=row("Tipo","Servicio","DIFERENTE · no es suministro");
html+=row("Objeto principal","Limpieza de la sede del CARL","La presencia de materiales y maquinaria es instrumental");
html+=row("Procedimiento","Abierto simplificado ordinario","No hereda el simplificado abreviado del golden");
html+=row("CPV principal",f.mainCpv,"Servicio de limpieza de oficinas");
html+=row("CPV accesorios",f.accessoryCpvs.join(", "),"Productos y máquinas vinculados a la prestación");
html+=row("Insuficiencia de medios propios",yes(f.insufficientOwnMeans),"Rasgo propio relevante de servicios");
html+=row("Subrogación de personal",yes(f.personnelSubrogation),"Activa tratamiento laboral específico; no existe en el golden");
html+=row("Materiales/maquinaria incluidos",yes(f.accessoryCleaningMaterialsAndMachineryIncluded),"No recalifican automáticamente el objeto principal");
html+='</tbody></table><div class="warning"><strong>Guarda de calificación:</strong> '+esc(CASE.contrastWithSupplyCases.criticalBoundary)+'</div><div class="warning"><strong>Alcance controlado.</strong> No se congelan todavía lotes, DA 33.ª, sistema económico, PBL/VE, duración/prórrogas, modificación, criterios y ponderaciones, solvencia, garantías, condiciones especiales, penalidades ni detalle económico de la subrogación. Esos extremos requieren extracción documental específica.</div>';
if(!validated){html+='<p><strong>Estado:</strong> primera extracción de servicios pendiente de validación humana.</p><button id="validateCarl005Extraction" type="button">Validar extracción documental 11.8</button>';}else{html+='<div class="info"><strong>11.8 validado por la persona usuaria.</strong> REG-SERVICE-005 queda listo para construir su primera regresión automática de servicios, sin convertirse en golden case.</div><button id="downloadCarl005Extraction" type="button" class="secondary">Descargar extracción 11.8 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionCarl005ExtractionCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionVeiasa006GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateCarl005Extraction"){var a=readAnswers();if(a.supplyRegressionVeiasa006AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión VEIASA 11.7.11.");return;}var m=manifest(true);a.serviceRegressionCarl005ExtractionValidated=true;a.serviceRegressionCarl005ExtractionVersion=VERSION;a.serviceRegressionCarl005ExtractionManifest=m;a.serviceRegressionCarl005Status="SOURCE_EXTRACTION_HUMAN_VALIDATED";a.serviceRegressionNextRecommendedStep="11.8.1";save(a);downloadJson(m);ensure();alert("Extracción de servicios 11.8 validada. REG-SERVICE-005 queda listo para su regresión automática específica.");return;}if(e.target.id==="downloadCarl005Extraction"){var a2=readAnswers();downloadJson(a2.serviceRegressionCarl005ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
