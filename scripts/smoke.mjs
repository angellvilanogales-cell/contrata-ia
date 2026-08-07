#!/usr/bin/env node
// scripts/smoke.mjs
import { start } from '../src/main.js';

(async ()=>{
  console.log('Running smoke start...');
  try{
    const ok = await start();
    console.log('start() returned:', ok);
    process.exit(ok ? 0 : 2);
  }catch(e){
    console.error(e);
    process.exit(3);
  }
})();
