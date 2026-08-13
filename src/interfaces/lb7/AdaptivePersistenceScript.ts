export const ADAPTIVE_PERSISTENCE_SCRIPT = `"use strict";
(function(){
var CASE_KEY="contrataIaAdaptiveCaseId";
var ANSWERS_KEY="contrataIaAdaptiveAnswers";
var CATALOGUE_KEY="contrataIaSupplyCatalogue";
var caseInput=document.getElementById("adaptiveCaseId");
var caseStatus=document.getElementById("adaptiveCaseStatus");
function currentCaseId(){return localStorage.getItem(CASE_KEY)||"";}
function setCaseId(id){if(id){localStorage.setItem(CASE_KEY,id);if(caseInput)caseInput.value=id;}else{localStorage.removeItem(CASE_KEY);if(caseInput)caseInput.value="";}}
function readJsonStorage(storage,key){try{return JSON.parse(storage.getItem(key)||"{}");}catch(e){return {};}}
function show(msg,isError){if(!caseStatus)return;caseStatus.textContent=msg;caseStatus.className=isError?"warning":"muted";}
async function api(url,options){var r=await fetch(url,Object.assign({credentials:"same-origin",headers:{"content-type":"application/json"}},options||{}));if(!r.ok){var msg="Error al acceder al expediente.";try{var d=await r.json();msg=d.error||msg;}catch(e){}var err=new Error(msg);err.status=r.status;throw err;}return r.json();}
async function createCase(){try{var created=await api("/api/adaptive/cases",{method:"POST",body:"{}"});setCaseId(created.caseId);sessionStorage.setItem(ANSWERS_KEY,"{}");sessionStorage.removeItem(CATALOGUE_KEY);localStorage.setItem(ANSWERS_KEY,"{}");localStorage.removeItem(CATALOGUE_KEY);show("Expediente creado: "+created.caseId+". Se guardará automáticamente tras cada respuesta.",false);location.reload();}catch(e){show(e.message,true);}}
async function loadCase(){var id=(caseInput&&caseInput.value||"").trim();if(!id){show("Indique el identificador EXP-... del expediente.",true);return;}try{var data=await api("/api/adaptive/cases/"+encodeURIComponent(id),{method:"GET"});setCaseId(data.caseId);var answers=JSON.stringify(data.answers||{});sessionStorage.setItem(ANSWERS_KEY,answers);localStorage.setItem(ANSWERS_KEY,answers);if(data.supplyCatalogue!==undefined){var cat=JSON.stringify(data.supplyCatalogue||{});sessionStorage.setItem(CATALOGUE_KEY,cat);localStorage.setItem(CATALOGUE_KEY,cat);}show("Expediente recuperado. Continuando desde la última respuesta guardada.",false);location.reload();}catch(e){show(e.message,true);}}
async function rehomeLocalCase(answers,catalogue){var created=await api("/api/adaptive/cases",{method:"POST",body:"{}"});var newId=created.caseId;await api("/api/adaptive/cases/"+encodeURIComponent(newId),{method:"PUT",body:JSON.stringify({answers:answers,supplyCatalogue:Object.keys(catalogue).length?catalogue:undefined})});setCaseId(newId);show("La copia anterior ya no existía en el servidor. Se ha recuperado automáticamente desde este navegador como "+newId+".",false);return newId;}
var persistQueue=Promise.resolve();
function persist(){var id=currentCaseId();if(!id)return Promise.resolve();persistQueue=persistQueue.then(async function(){var answers=readJsonStorage(sessionStorage,ANSWERS_KEY);var catalogue=readJsonStorage(sessionStorage,CATALOGUE_KEY);localStorage.setItem(ANSWERS_KEY,JSON.stringify(answers));if(Object.keys(catalogue).length)localStorage.setItem(CATALOGUE_KEY,JSON.stringify(catalogue));try{await api("/api/adaptive/cases/"+encodeURIComponent(id),{method:"PUT",body:JSON.stringify({answers:answers,supplyCatalogue:Object.keys(catalogue).length?catalogue:undefined})});show("Guardado automático: "+id,false);}catch(e){if(e&&e.status===404){try{id=await rehomeLocalCase(answers,catalogue);return;}catch(rehomeError){show("No se pudo reconstruir la copia del servidor. La información continúa guardada localmente. "+rehomeError.message,true);return;}}show("No se pudo guardar en servidor. Se conserva una copia local en este navegador. "+e.message,true);}});return persistQueue;}
function restoreLocalFallback(){var id=currentCaseId();if(!id)return;var localAnswers=localStorage.getItem(ANSWERS_KEY);if(localAnswers&&!sessionStorage.getItem(ANSWERS_KEY))sessionStorage.setItem(ANSWERS_KEY,localAnswers);var localCatalogue=localStorage.getItem(CATALOGUE_KEY);if(localCatalogue&&!sessionStorage.getItem(CATALOGUE_KEY))sessionStorage.setItem(CATALOGUE_KEY,localCatalogue);if(caseInput)caseInput.value=id;show("Expediente activo: "+id+". Guardado automático habilitado.",false);}
document.getElementById("newAdaptiveCase")?.addEventListener("click",createCase);
document.getElementById("loadAdaptiveCase")?.addEventListener("click",loadCase);
document.getElementById("forgetAdaptiveCase")?.addEventListener("click",function(){setCaseId("");sessionStorage.removeItem(ANSWERS_KEY);sessionStorage.removeItem(CATALOGUE_KEY);show("Sesión local desvinculada. Los expedientes guardados en servidor no se eliminan.",false);});
document.addEventListener("contrata-ia:adaptive-saved",function(){void persist();});
document.addEventListener("change",function(event){var t=event.target;if(t&&t.id==="supplyFile")setTimeout(function(){void persist();},0);},true);
restoreLocalFallback();
})();`;
