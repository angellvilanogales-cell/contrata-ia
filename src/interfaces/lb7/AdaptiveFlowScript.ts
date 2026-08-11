export const ADAPTIVE_FLOW_SCRIPT = `"use strict";
(function(){
var raw=sessionStorage.getItem("contrataIaAdaptiveAnswers")||"{}";
var answers={};
try{answers=JSON.parse(raw);}catch(e){answers={};sessionStorage.removeItem("contrataIaAdaptiveAnswers");}
if(answers.economicCorrectionTarget!==undefined&&answers.economicCorrectionTarget!=="INITIAL"&&answers.economicCorrectionTarget!=="RECURRING"){delete answers.economicCorrectionTarget;sessionStorage.setItem("contrataIaAdaptiveAnswers",JSON.stringify(answers));}
var work=document.getElementById("work");
var status=document.getElementById("sessionStatus");
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function money(v){return typeof v==="number"?v.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €":"Pendiente";}
function humanNature(v){return v==="SERVICES"?"Servicios":v==="SUPPLIES"?"Suministros":"Pendiente de clasificar";}
function humanLots(v){return v==="SINGLE_LOT"?"Lote único propuesto":v==="MULTIPLE_LOTS"?"Varios lotes propuestos":"Pendiente de análisis";}
function humanProcedure(v){return v==="OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE"?"Abierto simplificado abreviado — propuesta":v==="OPEN_SIMPLIFIED_CANDIDATE"?"Abierto simplificado — propuesta":v==="OPEN_PROCEDURE_REVIEW_REQUIRED"?"Procedimiento a revisar según cuantía y régimen aplicable":"Pendiente";}
function option(value,label){return '<option value="'+esc(value)+'">'+esc(label)+'</option>';}
function inputFor(q){
if(q.id==="contentResponsibility")return '<select id="ans"><option value="">Seleccione</option>'+option("ADMIN_SUPPLIES_CONTRACTOR_ADAPTS","La Administración aporta la información y la empresa la adapta/publica")+option("CONTRACTOR_CREATES","La empresa también crea contenido sustantivo")+option("NOT_APPLICABLE","No procede")+'</select>';
if(q.id==="technicalContinuity")return '<select id="ans"><option value="">Seleccione</option>'+option("SAME_CONTRACTOR_PREFERRED","Es preferible una misma empresa por continuidad/coordinación técnica")+option("SEPARABLE","Pueden ejecutarse separadamente sin problemas relevantes")+option("UNKNOWN","No lo sé")+'</select>';
if(q.id==="dominantComponent")return '<select id="ans"><option value="">Seleccione</option>'+option("INITIAL_DEVELOPMENT","Predomina la prestación inicial/desarrollo")+option("RECURRENT_SERVICE","Predomina el servicio recurrente")+option("GOODS","Predomina la adquisición de bienes")+option("BALANCED","Peso parecido")+option("UNKNOWN","No lo sé")+'</select>';
if(q.id==="economicCorrectionTarget")return '<select id="ans"><option value="">Seleccione qué dato quiere revisar</option>'+option("INITIAL","Coste inicial de diseño, desarrollo y puesta en marcha")+option("RECURRING","Coste anual de mantenimiento, actualización y soporte")+'</select>';
if(q.id==="requiresNonFormulaQualityAssessment")return '<select id="ans"><option value="">Seleccione</option><option value="false">No</option><option value="true">Sí</option></select>';
if(q.id==="extensionMonths")return '<input id="ans" placeholder="Ej.: 12, 12">';
if(["initialBudgetExVat","initialDurationMonths","initialOneOffCostExVat","recurringAnnualCostExVat"].includes(q.id))return '<input id="ans" inputmode="decimal" placeholder="Ej.: 8.000 € o 8000">';
return '<textarea id="ans" placeholder="Responda con lenguaje natural"></textarea>';
}
function parseSpanishNumber(rawValue){
var s=String(rawValue||"").trim().replace(/\\s/g,"").replace(/€/g,"");
if(!s)throw new Error("Indique una cifra válida.");
var lastComma=s.lastIndexOf(",");
var lastDot=s.lastIndexOf(".");
if(lastComma>=0&&lastDot>=0){if(lastComma>lastDot)s=s.replaceAll(".","").replace(",",".");else s=s.replaceAll(",","");}
else if(lastComma>=0)s=s.replace(",",".");
else if(lastDot>=0){var parts=s.split(".");if(parts.length>2||((parts[parts.length-1]||"").length===3&&parts.length===2))s=parts.join("");}
var n=Number(s);
if(!Number.isFinite(n))throw new Error("Indique una cifra válida. Puede escribir, por ejemplo, 8000, 8.000 o 8.000,00 €.");
return n;
}
function parseValue(id,rawValue){
if(id==="requiresNonFormulaQualityAssessment")return rawValue==="true";
if(id==="extensionMonths")return rawValue.split(",").map(function(x){return Number(x.trim());}).filter(function(x){return Number.isFinite(x)&&x>=0;});
if(["initialBudgetExVat","initialDurationMonths","initialOneOffCostExVat","recurringAnnualCostExVat"].includes(id))return parseSpanishNumber(rawValue);
return rawValue;
}
async function callAnalyze(){var r=await fetch("/api/adaptive/analyze",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({answers:answers})});if(!r.ok){var m="Error";try{var d=await r.json();m=d.error||m;}catch(e){}throw new Error(m);}return r.json();}
function renderDecision(d){var h='<div class="card"><h2>Interpretación acumulada</h2><div class="grid"><div><strong>Naturaleza contractual</strong></div><div>'+esc(humanNature(d.contractNature))+'<br><span class="muted">'+esc(d.contractNatureReason)+'</span></div><div><strong>Lotes</strong></div><div>'+esc(humanLots(d.lotProposal))+'<br><span class="muted">'+esc(d.lotReason)+'</span></div><div><strong>Valor estimado provisional</strong></div><div>'+esc(money(d.economics.estimatedValueExVat))+'<br><span class="muted">'+esc(d.economics.note)+'</span></div><div><strong>Procedimiento</strong></div><div>'+esc(humanProcedure(d.procedure))+'<br><span class="muted">'+esc(d.procedureReason)+'</span></div></div>';
if(d.cpv&&d.cpv.length)h+='<h3>CPV propuestos</h3><ul>'+d.cpv.map(function(x){return '<li><strong>'+esc(x.code)+'</strong> · '+esc(x.label)+' ('+(x.role==="PRIMARY"?"principal":"complementario")+')</li>';}).join("")+'</ul>';
if(d.economics.annualProjection&&d.economics.annualProjection.length)h+='<h3>Proyección económica</h3><ul>'+d.economics.annualProjection.map(function(x){return '<li>'+esc(x.period)+': <strong>'+esc(money(x.amountExVat))+'</strong></li>';}).join("")+'</ul>';
if(d.proposals&&d.proposals.length)h+='<h3>Propuestas del sistema</h3><ul>'+d.proposals.map(function(x){return '<li>'+esc(x)+"</li>";}).join("")+'</ul>';
if(d.warnings&&d.warnings.length)h+=d.warnings.map(function(x){return '<div class="warning">'+esc(x)+'</div>';}).join("");
h+='<div class="info"><strong>Criterios de adjudicación:</strong> '+esc(d.awardCriteriaConstraint)+'</div><details><summary>Ver fundamento jurídico</summary>'+d.legalGrounds.map(function(x){return '<p><strong>'+esc(x.article)+'</strong><br>'+esc(x.rule)+'<br><span class="muted">Verificación de normativa vigente obligatoria antes de cerrar el expediente.</span></p>';}).join("")+'</details></div>';return h;}
function correctionCard(){var initial=answers.initialOneOffCostExVat==null?"":answers.initialOneOffCostExVat;var recurring=answers.recurringAnnualCostExVat==null?"":answers.recurringAnnualCostExVat;return '<div class="card warning"><h2>Corregir distribución económica</h2><p>La espina dorsal no puede darse por completada mientras estas cifras no cuadren con el presupuesto inicial.</p><label><strong>Coste inicial no recurrente</strong></label><input id="fixInitial" inputmode="decimal" value="'+esc(initial)+'"><label><strong>Coste anual de mantenimiento o prestación recurrente</strong></label><input id="fixRecurring" inputmode="decimal" value="'+esc(recurring)+'"><button id="saveEconomicFix">Guardar corrección económica</button></div>';}
async function analyze(){try{var d=await callAnalyze();status.textContent="Sesión autenticada.";var html=renderDecision(d);var needsEconomicFix=d.economics&&d.economics.status==="INCONSISTENT";if(needsEconomicFix){html+=correctionCard();}else if(d.nextQuestion){html+='<div class="card"><h2>Siguiente pregunta</h2><h3>'+esc(d.nextQuestion.label)+'</h3><p>'+esc(d.nextQuestion.help)+'</p>'+inputFor(d.nextQuestion)+'<button id="saveAnswer">Guardar y continuar</button></div>';}else{html+='<div class="card info"><h2>Espina dorsal completada</h2><p>Ya pueden abrirse las ramas específicas que correspondan.</p></div>';}work.innerHTML=html;if(needsEconomicFix){document.getElementById("saveEconomicFix").addEventListener("click",async function(){try{var initialEl=document.getElementById("fixInitial");var recurringEl=document.getElementById("fixRecurring");answers.initialOneOffCostExVat=parseSpanishNumber(initialEl.value);answers.recurringAnnualCostExVat=parseSpanishNumber(recurringEl.value);delete answers.economicCorrectionTarget;sessionStorage.setItem("contrataIaAdaptiveAnswers",JSON.stringify(answers));await analyze();}catch(e){alert(e.message);}});}else if(d.nextQuestion){document.getElementById("saveAnswer").addEventListener("click",async function(){var el=document.getElementById("ans");if(!el||!el.value.trim()){alert("Indique una respuesta.");return;}try{var id=d.nextQuestion.id;answers[id]=parseValue(id,el.value.trim());if((id==="initialOneOffCostExVat"||id==="recurringAnnualCostExVat")&&answers.economicCorrectionTarget)delete answers.economicCorrectionTarget;sessionStorage.setItem("contrataIaAdaptiveAnswers",JSON.stringify(answers));await analyze();}catch(e){alert(e.message);}});}}catch(e){status.textContent="Sesión no autenticada o error de acceso.";work.innerHTML='<div class="card warning">'+esc(e.message)+'</div>';}}
document.getElementById("resetFlow").addEventListener("click",function(){answers={};sessionStorage.removeItem("contrataIaAdaptiveAnswers");analyze();});
analyze();
})();`;
