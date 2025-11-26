// excel/utils/excelHelpers.ts
import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";

export function loadWorkbook(fileAbsolutePath: string) {
  const resolved = path.resolve(fileAbsolutePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Excel file not found: ${resolved}`);
  }
  return { workbook: xlsx.readFile(resolved), resolved };
}

export function saveWorkbook(workbook: xlsx.WorkBook, fileAbsolutePath: string) {
  const resolved = path.resolve(fileAbsolutePath);
  xlsx.writeFile(workbook, resolved);
  return resolved;
}