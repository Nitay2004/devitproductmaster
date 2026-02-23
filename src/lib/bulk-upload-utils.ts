import { supabase } from "@/lib/supabase"
import { Readable } from "stream"

export type RawExcelData = Record<string, unknown>;

export function findValue(item: RawExcelData, ...targets: string[]) {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[-_.]/g, "").replace(/[()]/g, "");
  const normTargets = targets.map(normalize);
  
  // 1. Direct match with normalization
  for (const key in item) {
    const k = normalize(key);
    if (normTargets.includes(k)) return item[key];
  }

  // 2. Common aliases (from original bulk-upload.ts)
  const aliases: Record<string, string[]> = {
    make: ['brand', 'manufacturer', 'mfr'],
    modelNumber: ['model', 'modelno', 'modelnumber', 'sku', 'partnumber'],
    productName: ['name', 'description', 'title', 'product'],
    salePrice: ['price', 'mrp', 'cost', 'sellingprice', 'rate'],
    frontPanel: ['frontpanel(bazel)', 'frontpanelbazel', 'bazel', 'frontpanel'],
    panel: ['panel'],
    screenNonTouch: ['screennontouch', 'screen-nontouch', 'screen-non-touch', 'displaynontouch', 'screen'],
    screenTouch: ['screentouch', 'screen-touch', 'displaytouch'],
    hinge: ['hinge'],
    touchPad: ['touchpad', 'touch pad'],
    base: ['base'],
    keyboard: ['keyboard'],
    battery: ['battery', 'batt'],
    ram: ['ram', 'memory', 'ramcapacity', 'ram capacity'],
    hdd: ['hdd', 'harddrive', 'hard drive'],
    ssd: ['ssd', 'solidstatedrive', 'solid state drive'],
    tagNo: ['tag no', 'tag', 'tagno'],
    lotNumber: ['lot number', 'lot no', 'lotnumber'],
  };

  for (const target of targets) {
    const alts = aliases[target];
    if (alts) {
      for (const key in item) {
        const k = normalize(key);
        const normAlts = alts.map(normalize);
        if (normAlts.includes(k)) return item[key];
      }
    }
  }

  return undefined;
}

export function mapRowToData(row: any, headerMap: Record<string, number>): RawExcelData {
  const data: RawExcelData = {};
  Object.keys(headerMap).forEach(header => {
    data[header] = row.getCell(headerMap[header]).value;
  });
  return data;
}

export async function getExcelStream(filePath: string) {
  const { data, error } = await supabase.storage.from('bulk-imports').createSignedUrl(filePath, 3600);
  if (error || !data) throw new Error("Failed to get signed URL for file");
  
  const response = await fetch(data.signedUrl);
  if (!response.body) throw new Error("Failed to get file stream");
  
  return Readable.fromWeb(response.body as any);
}
