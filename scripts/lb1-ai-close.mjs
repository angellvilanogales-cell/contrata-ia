#!/usr/bin/env node
import fs from 'node:fs';
const file='src/infrastructure/ai/AIManager.ts';
const source=fs.readFileSync(file,'utf8');
const needle='return await this.healthCheck();\n\n\n\n\n/*===========================================================================\n=\n= AUTOINICIALIZACIÓN';
if(!source.includes(needle)) throw new Error('AIManager validation/autoinitialization boundary not found');
const fixed=source.replace(needle,'return await this.healthCheck();\n\n}\n\n\n/*===========================================================================\n=\n= AUTOINICIALIZACIÓN');
fs.writeFileSync(file,fixed);
console.log('AIManager validate() closure restored');
