export interface ApplicationInfo {
  name: "contrata-ia";
  version: string;
  status: "initialized";
}

export function createApplication(): ApplicationInfo {
  return {
    name: "contrata-ia",
    version: "0.1.0",
    status: "initialized"
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(createApplication()));
}
