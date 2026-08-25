import { inflateRawSync, deflateRawSync } from "node:zlib";

export interface OdtZipEntry {
  name: string;
  bytes: Uint8Array;
  method: 0 | 8;
  modTime: number;
  modDate: number;
  externalAttributes: number;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function findEocd(buffer: Buffer): number {
  const minimum = Math.max(0, buffer.length - 0xffff - 22);
  for (let i = buffer.length - 22; i >= minimum; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) return i;
  }
  throw new Error("ODT inválido: no se encuentra el directorio ZIP.");
}

export function readOdtZip(bytes: Uint8Array): OdtZipEntry[] {
  const buffer = Buffer.from(bytes);
  const eocd = findEocd(buffer);
  const count = buffer.readUInt16LE(eocd + 10);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const entries: OdtZipEntry[] = [];
  let cursor = centralOffset;

  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error("ODT inválido: directorio ZIP corrupto.");
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const modTime = buffer.readUInt16LE(cursor + 12);
    const modDate = buffer.readUInt16LE(cursor + 14);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const externalAttributes = buffer.readUInt32LE(cursor + 38);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");

    if ((flags & 0x1) !== 0) throw new Error(`ODT no soportado: entrada cifrada ${name}.`);
    if (method !== 0 && method !== 8) throw new Error(`ODT no soportado: método ZIP ${method} en ${name}.`);
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`ODT inválido: cabecera local ausente en ${name}.`);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const raw = method === 0 ? Buffer.from(compressed) : inflateRawSync(compressed);
    entries.push({ name, bytes: raw, method: method as 0 | 8, modTime, modDate, externalAttributes });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function localHeader(entry: OdtZipEntry, compressed: Buffer): Buffer {
  const name = Buffer.from(entry.name, "utf8");
  const header = Buffer.alloc(30 + name.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(entry.method, 8);
  header.writeUInt16LE(entry.modTime, 10);
  header.writeUInt16LE(entry.modDate, 12);
  header.writeUInt32LE(crc32(entry.bytes), 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(entry.bytes.byteLength, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  name.copy(header, 30);
  return header;
}

export function writeOdtZip(input: readonly OdtZipEntry[]): Uint8Array {
  const entries = [...input];
  const mimeIndex = entries.findIndex(entry => entry.name === "mimetype");
  if (mimeIndex > 0) entries.unshift(...entries.splice(mimeIndex, 1));
  if (entries[0]?.name === "mimetype") entries[0] = { ...entries[0], method: 0 };

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const raw = Buffer.from(entry.bytes);
    const compressed = entry.method === 0 ? raw : deflateRawSync(raw);
    const local = localHeader(entry, compressed);
    localParts.push(local, compressed);

    const name = Buffer.from(entry.name, "utf8");
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(entry.method, 10);
    central.writeUInt16LE(entry.modTime, 12);
    central.writeUInt16LE(entry.modDate, 14);
    central.writeUInt32LE(crc32(entry.bytes), 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(entry.externalAttributes, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centralParts.push(central);
    offset += local.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, eocd]);
}
