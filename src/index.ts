import { initApp } from './bootstrap';

async function main() {
  const status = await initApp();
  if (status.ok) {
    console.log('Contrata-IA bootstrap OK. Knowledge version:', status.version);
    process.exit(0);
  } else {
    console.error('Contrata-IA bootstrap failed:', status.reason);
    if (status.details) console.error(status.details);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}
