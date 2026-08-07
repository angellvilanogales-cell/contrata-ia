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

if (require.main === module) {
  console.log(JSON.stringify(createApplication()));
}
