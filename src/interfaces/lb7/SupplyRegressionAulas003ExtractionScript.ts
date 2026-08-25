import { SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES } from "../../regression/SupplyRegressionCase003AulasDigitales";

const AULAS_CASE_JSON = JSON.stringify(SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES);

export const SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SUPPLY-003-AULAS-EXTRACTION-11.7.4-v1";
var CASE=${AULAS_CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"aulas-extraction-11.7.4"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,contrastWithGolden:CASE.contrastWithGolden,regressionGuards:CASE.regressionGuards,extractionScope:CASE.extractionScope,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SUPPLY-003_Aulas_11-7-4.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.supplyRegressionPanda002AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.supplyRegressionAulas003ExtractionValidated===true;var html='<div id="supplyRegressionAulas003ExtractionCard" class="card" style="margin-top:14px"><h3>11.7.4 REG-SUPPLY-003 · Aulas digitales</h3><div class="info"><strong>Extracción estructurada de contraste.</strong> Se fijan únicamente los hechos ya identificados en las fuentes del caso y en la matriz 11.7. Los importes, CPV por lote, duración exacta y detalle fino de criterios no se congelan todavía.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>Aulas digitales</th><th>Contraste golden</th></tr></thead><tbody>';
html+=row("Tipo","Suministro","IGUAL");
html+=row("Procedimiento","Abierto","DIFERENTE · golden: simplificado abreviado");
html+=row("SARA",yes(f.sara),"DIFERENTE · activa publicidad y controles propios SARA");
html+=row("Lotes",f.lotCount+" lotes","DIFERENTE · golden: lote único");
html+=row("DA 33.ª",yes(f.needsBasedDA33),"IGUAL · contrato en función de necesidades");
html+=row("Fondos europeos",yes(f.europeanFunds),"DIFERENTE · golden autofinanciado");
html+=row("Precio","Precios unitarios","IGUAL en modalidad");
html+=row("Adjudicación","Criterios múltiples","DIFERENTE · golden: precio único 100 puntos");
html+=row("Prórroga",yes(f.extensions),"Existe, pero el detalle temporal queda fuera de 11.7.4");
html+=row("Modificación prevista",yes(f.plannedModification),"Existe, pero causa y porcentaje concreto quedan fuera de 11.7.4");
html+='</tbody></table><div class="warning"><strong>Guardas para la siguiente regresión:</strong> el motor no podrá reducir este expediente a lote único, procedimiento abreviado, precio único o autofinanciación. Debe conservar 9 lotes, procedimiento abierto, SARA, DA 33.ª, fondos europeos, precios unitarios y pluralidad de criterios.</div><div class="warning"><strong>Alcance controlado.</strong> Esta validación no confirma todavía importes, CPV por lote, fórmulas, ponderaciones, duración exacta, causa concreta de modificación, condiciones especiales ni garantías. Esos campos requieren extracción documental específica antes de congelarse.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción de cobertura pendiente de validación humana.</p><button id="validateAulas003Extraction" type="button">Validar extracción documental 11.7.4</button>';}else{html+='<div class="info"><strong>11.7.4 validado por la persona usuaria.</strong> El caso queda listo para construir su regresión específica sin convertirse en golden case.</div><button id="downloadAulas003Extraction" type="button" class="secondary">Descargar extracción 11.7.4 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyRegressionAulas003ExtractionCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionPanda002GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateAulas003Extraction"){var a=readAnswers();if(a.supplyRegressionPanda002AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión Panda 11.7.3.");return;}var m=manifest(true);a.supplyRegressionAulas003ExtractionValidated=true;a.supplyRegressionAulas003ExtractionVersion=VERSION;a.supplyRegressionAulas003ExtractionManifest=m;a.supplyRegressionAulas003Status="SOURCE_EXTRACTION_HUMAN_VALIDATED";a.supplyRegressionNextRecommendedCase="REG-SUPPLY-003";save(a);downloadJson(m);ensure();alert("Extracción 11.7.4 validada. Aulas digitales queda lista para construir su regresión automática específica.");return;}if(e.target.id==="downloadAulas003Extraction"){var a2=readAnswers();downloadJson(a2.supplyRegressionAulas003ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
