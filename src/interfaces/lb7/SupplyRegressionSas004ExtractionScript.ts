import { SUPPLY_REGRESSION_CASE_004_SAS_470 } from "../../regression/SupplyRegressionCase004Sas470";

const SAS_CASE_JSON = JSON.stringify(SUPPLY_REGRESSION_CASE_004_SAS_470);

export const SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SUPPLY-004-SAS-EXTRACTION-11.7.6-v1";
var CASE=${SAS_CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"sas-extraction-11.7.6"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,contrastWithGolden:CASE.contrastWithGolden,regressionGuards:CASE.regressionGuards,extractionScope:CASE.extractionScope,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SUPPLY-004_SAS470_11-7-6.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.supplyRegressionAulas003AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.supplyRegressionSas004ExtractionValidated===true;var html='<div id="supplyRegressionSas004ExtractionCard" class="card" style="margin-top:14px"><h3>11.7.6 REG-SUPPLY-004 · SAS 470/2025</h3><div class="info"><strong>Extracción estructurada de contraste.</strong> El caso introduce un acuerdo marco de suministro con lotes, tracto sucesivo, precios unitarios y criterios múltiples. Solo se congelan los hechos ya identificados en las fuentes y la matriz; los detalles finos permanecen pendientes.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>SAS 470/2025</th><th>Contraste golden</th></tr></thead><tbody>';
html+=row("Tipo","Suministro","IGUAL");
html+=row("Instrumento","Acuerdo marco","DIFERENTE · golden: contrato de suministro ordinario");
html+=row("Procedimiento","Abierto","DIFERENTE · golden: simplificado abreviado");
html+=row("Lotes",yes(f.lots),"DIFERENTE · golden: lote único");
html+=row("Tracto sucesivo",yes(f.successiveSupply),"DIFERENTE · obliga a tratar necesidades sucesivas dentro del acuerdo marco");
html+=row("Precio","Precios unitarios","IGUAL en modalidad");
html+=row("Adjudicación","Criterios múltiples","DIFERENTE · golden: precio único 100 puntos");
html+=row("Juicio de valor",yes(f.judgmentValueCriteria),"DIFERENTE · requiere evaluación cualitativa");
html+=row("Criterios automáticos",yes(f.automaticCriteria),"Coexisten con el juicio de valor");
html+=row("Modificación prevista",yes(f.plannedModification),"Existe, pero porcentaje y causa concreta quedan fuera de 11.7.6");
html+='</tbody></table><div class="warning"><strong>Guardas para la siguiente regresión:</strong> el motor no podrá convertir este acuerdo marco en un contrato ordinario, reducirlo a lote único, imponer procedimiento abreviado ni eliminar la coexistencia de juicio de valor y criterios automáticos. Debe conservar acuerdo marco, procedimiento abierto, lotes, tracto sucesivo, precios unitarios y criterios múltiples.</div><div class="warning"><strong>Alcance controlado.</strong> No se congelan todavía número/descripción de lotes, importes, CPV, duración, prórrogas, porcentaje/causa de modificación, ponderaciones, fórmulas, adjudicatarios máximos, contratos basados, garantías ni condiciones especiales. Esos datos requieren extracción documental específica.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción de cobertura pendiente de validación humana.</p><button id="validateSas004Extraction" type="button">Validar extracción documental 11.7.6</button>';}else{html+='<div class="info"><strong>11.7.6 validado por la persona usuaria.</strong> El caso queda listo para construir su regresión específica sin convertirse en golden case.</div><button id="downloadSas004Extraction" type="button" class="secondary">Descargar extracción 11.7.6 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyRegressionSas004ExtractionCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionAulas003GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateSas004Extraction"){var a=readAnswers();if(a.supplyRegressionAulas003AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión Aulas digitales 11.7.5.");return;}var m=manifest(true);a.supplyRegressionSas004ExtractionValidated=true;a.supplyRegressionSas004ExtractionVersion=VERSION;a.supplyRegressionSas004ExtractionManifest=m;a.supplyRegressionSas004Status="SOURCE_EXTRACTION_HUMAN_VALIDATED";a.supplyRegressionNextRecommendedCase="REG-SUPPLY-004";save(a);downloadJson(m);ensure();alert("Extracción 11.7.6 validada. SAS 470/2025 queda listo para construir su regresión automática específica.");return;}if(e.target.id==="downloadSas004Extraction"){var a2=readAnswers();downloadJson(a2.supplyRegressionSas004ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
