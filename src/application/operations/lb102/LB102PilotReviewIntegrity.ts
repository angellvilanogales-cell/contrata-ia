export function parseExpectedPackageSha256(value:unknown):string{
 const sha=typeof value==="string"?value.trim().toLowerCase():"";
 if(!/^[a-f0-9]{64}$/.test(sha))throw new Error("SHA-256 esperado del paquete inválido.");
 return sha;
}

export function assertReviewedPackageSha(expected:string,actual:string):void{
 if(expected!==actual)throw new Error("El paquete generado ya no coincide con el SHA-256 que fue revisado. Regenera, vuelve a comprobar el ZIP y registra la revisión sobre ese paquete exacto.");
}
