export async function start(): Promise<boolean> {
  // Minimal bootstrap for LB-1: do not load domain engines here.
  console.log('Contrata-IA minimal bootstrap (LB-1)');
  // In future steps this will initialize ApplicationKernel and ServiceRegistry.
  return true;
}
