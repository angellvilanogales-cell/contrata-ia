export const LB106_VIRGIN_PILOT_SCRIPT = String.raw`(function(){
function node(tag,text,className){var value=document.createElement(tag);if(text!==undefined)value.textContent=text;if(className)value.className=className;return value;}
function addLine(parent,label,value){var p=node("p");var strong=node("strong",label+": ");p.appendChild(strong);p.appendChild(document.createTextNode(value));parent.appendChild(p);}
async function read(url){var response=await fetch(url,{credentials:"same-origin"});var value=await response.json();if(!response.ok)throw new Error((value.blockers||[]).join(" · ")||value.error||"Control LB106 no disponible.");return value;}
async function mount(){
  var work=document.getElementById("work");if(!work||document.getElementById("lb106VirginPilot"))return;
  var card=node("section",undefined,"card");card.id="lb106VirginPilot";
  card.appendChild(node("h2","Piloto virgen · matriz de decisiones LB106"));
  var status=node("p","Comprobando que el expediente puede comenzar sin datos heredados...","muted");card.appendChild(status);
  work.parentNode.insertBefore(card,work);
  try{
    var values=await Promise.all([read("/api/lb106/virgin-pilot"),read("/api/lb106/decision-matrix")]);
    var readiness=values[0],matrix=values[1];
    status.textContent="Preparado para comenzar desde cero: "+matrix.audit.decisionCount+" decisiones, "+matrix.audit.legalBasisCount+" fundamentos jurídicos, "+matrix.audit.coveredMemorySections+" epígrafes de Memoria y "+matrix.audit.coveredPptSections+" de PPT.";
    status.className="info";
    addLine(card,"PCAP","Modelo oficial inmutable; el aplicativo solo cumplimenta destinos autorizados.");
    addLine(card,"Respuestas precargadas",readiness.answersPreloaded?"Sí":"No");
    addLine(card,"Casos fuente reutilizados",readiness.sourceCaseIdsUsed.length?readiness.sourceCaseIdsUsed.join(", "):"Ninguno");
    addLine(card,"Regla de decisión",readiness.startRule);
    var button=node("button","Crear expediente piloto virgen");button.type="button";button.id="startLb106VirginPilot";
    button.addEventListener("click",function(){var existing=document.getElementById("newAdaptiveCase");if(existing)existing.click();});card.appendChild(button);
    var help=node("p","El expediente que estuviera guardado no se elimina. Se crea otro identificador vacío y cada decisión exigirá validación humana.","muted");card.appendChild(help);
    var details=node("details");details.appendChild(node("summary","Ver las 20 decisiones y sus fundamentos"));
    matrix.decisions.forEach(function(decision){
      var item=node("details");item.appendChild(node("summary",decision.id+" · "+decision.title));
      addLine(item,"Pregunta",decision.question);addLine(item,"Criterio de propuesta",decision.proposalRule);addLine(item,"Aplicación al expediente",decision.applicationRule);
      var list=node("ul");decision.legalBases.forEach(function(legal){var li=node("li");li.appendChild(document.createTextNode(legal.norm+", artículo "+legal.article+", apartado "+legal.paragraph+": «"+legal.relevantOfficialExcerpt+"». "));var link=node("a","Texto oficial BOE");link.href=legal.officialUrl;link.target="_blank";link.rel="noopener noreferrer";li.appendChild(link);list.appendChild(li);});item.appendChild(list);
      addLine(item,"Consentimiento","Validar, modificar o rechazar motivadamente por la persona responsable.");details.appendChild(item);
    });
    card.appendChild(details);
  }catch(error){status.textContent="Bloqueado: "+(error&&error.message?error.message:String(error));status.className="warning";}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();`;
