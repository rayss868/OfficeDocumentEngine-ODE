// excel/functions/excel_copy_sheet.ts
import { loadWorkbook, saveWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import { z } from "zod";
import { ExcelCopySheetSchema } from "../types";

/**
 * excel_copy_sheet
 * Copy sheet src → dst di file yang sama.
 */
export function excel_copy_sheet(args: z.infer<typeof ExcelCopySheetSchema>) {
  const { fileAbsolutePath, srcSheetName, dstSheetName } = ExcelCopySheetSchema.parse(args);
  const { workbook, resolved } = loadWorkbook(fileAbsolutePath);
  const src = workbook.Sheets[srcSheetName];
  if (!src) throw new Error(`Source sheet not found: ${srcSheetName}`);

  if (workbook.Sheets[dstSheetName]) {
    throw new Error(`Destination sheet already exists: ${dstSheetName}`);
  }

  // clone sederhana
  const cloned = JSON.parse(JSON.stringify(src));
  workbook.Sheets[dstSheetName] = cloned;
  workbook.SheetNames.push(dstSheetName);

  const saved = saveWorkbook(workbook, resolved);

  return {
    file: saved,
    srcSheetName,
    dstSheetName,
  };
}