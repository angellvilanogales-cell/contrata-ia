#!/usr/bin/env node
import fs from 'node:fs';

function write(file, next) {
  const before = fs.readFileSync(file, 'utf8');
  const after = next(before);
  if (after === before) throw new Error(`Expected repair not applied: ${file}`);
  fs.writeFileSync(file, after);
  console.log(`repaired ${file}`);
}

function maskNonCode(source) {
  let out='', i=0, state='code', quote='';
  while (i < source.length) {
    const c=source[i], n=source[i+1];
    if (state==='code') {
      if (c==='/'&&n==='/'){state='line';out+='  ';i+=2;continue;}
      if (c==='/'&&n==='*'){state='block';out+='  ';i+=2;continue;}
      if (c==='"'||c==="'"||c==='`'){state='string';quote=c;out+=' ';i++;continue;}
      out+=c;i++;continue;
    }
    if (state==='line'){ if(c==='\n'){state='code';out+='\n';}else out+=' ';i++;continue; }
    if (state==='block'){ if(c==='*'&&n==='/'){out+='  ';i+=2;state='code';}else{out+=c==='\n'?'\n':' ';i++;}continue; }
    if (state==='string'){ if(c==='\\'){out+='  ';i+=2;continue;} if(c===quote){out+=' ';i++;state='code';continue;} out+=c==='\n'?'\n':' ';i++; }
  }
  return out;
}

function matchingBrace(masked, open) {
  let depth=0;
  for(let i=open;i<masked.length;i++){
    if(masked[i]==='{')depth++;
    else if(masked[i]==='}') { depth--; if(depth===0)return i; }
  }
  return -1;
}

function hoistExportsFromClassFile(source, className) {
  const masked=maskNonCode(source);
  const classRe=new RegExp(`export\\s+class\\s+${className}\\b`);
  const cm=classRe.exec(masked);
  if(!cm) throw new Error(`class ${className} not found`);
  const classStart=cm.index;
  const declRe=/export\s+(interface|enum|type)\s+[A-Za-z_$][\w$]*/g;
  const ranges=[];
  let m;
  while((m=declRe.exec(masked))){
    if(m.index<classStart)continue;
    let end;
    if(m[1]==='type'){
      end=masked.indexOf(';',m.index);
      if(end<0)throw new Error('unterminated export type');
      end++;
    } else {
      const open=masked.indexOf('{',m.index);
      const close=matchingBrace(masked,open);
      if(open<0||close<0)throw new Error(`unterminated export ${m[1]}`);
      end=close+1;
    }
    while(end<source.length&&/[ \t\r\n]/.test(source[end]))end++;
    ranges.push([m.index,end]);
    declRe.lastIndex=end;
  }
  if(!ranges.length)return source;
  const declarations=ranges.map(([s,e])=>source.slice(s,e).trim()).join('\n\n');
  let body=source;
  for(const [s,e] of ranges.slice().reverse())body=body.slice(0,s)+body.slice(e);
  const newClassStart=classRe.exec(maskNonCode(body)).index;
  return body.slice(0,newClassStart)+declarations+'\n\n'+body.slice(newClassStart);
}

write('src/domain/legal/LegalReasoner.ts', s => s.trimEnd().endsWith('}') ? s : s.trimEnd()+'\n\n}\n');
write('src/domain/legal/LegalReferenceEngine.ts', s => s.replace(/\n}\s*\n\s*}\s*$/, '\n}\n'));
write('src/domain/plugins/PluginManager.ts', s => s.replace(/\n}\s*\n\s*}\s*$/, '\n}\n'));

write('src/domain/pcap/PCAPGeneratorEngine.ts', s => {
  const pattern=/\n\s*=+\s*\nARCHIVO\s*\n\s*PCAPGeneratorEngine\.ts\s*\n\s*BLOQUE\s*\n\s*\d+ de 12\s*\n\s*ESTADO\s*\n[\s\S]*?\nSIGUIENTE\s*\n[\s\S]*?\nRUTA\s*\n\s*src\/domain\/pcap\/PCAPGeneratorEngine\.ts\s*\n\s*=+\s*\n/g;
  const out=s.replace(pattern,'\n');
  if(out===s)throw new Error('PCAP metadata corruption block not found');
  return out;
});

write('src/domain/resolvers/AwardCriteriaResolver.ts', s => {
  const needle='/**\n * ============================================================\n * CONTRATA-IA\n * ------------------------------------------------------------\n * AwardCriteriaResolver';
  const first=s.indexOf(needle);
  const second=s.indexOf(needle,first+needle.length);
  if(first<0||second<0)throw new Error('duplicated AwardCriteriaResolver copy not found');
  return s.slice(second);
});

write('src/domain/rules/RuleEngine.ts', s => hoistExportsFromClassFile(s,'RuleEngine'));
