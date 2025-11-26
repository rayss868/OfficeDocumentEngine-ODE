// excel/functions/excel_create_table.ts
import { loadWorkbook, saveWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import { z } from "zod";
import { ExcelCreateTableSchema } from "../types";

/**
 * excel_create_table
 * Di .xlsx aslinya "table" itu kompleks.
 * Versi simple di sini: bikin Named Range dengan nama tableName.
 */
export function excel_create_table(args: z.infer<typeof ExcelCreateTableSchema>) {
  const { fileAbsolutePath, sheetName, range, tableName } = ExcelCreateTableSchema.parse(args);
  const { workbook, resolved } = loadWorkbook(fileAbsolutePath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

  const finalRange = range || sheet["!ref"];
  if (!finalRange) {
    throw new Error("Sheet has no !ref range; specify range manually.");
  }

  workbook.Workbook = workbook.Workbook || {};
  workbook.Workbook.Names = workbook.Workbook.Names || [];

  workbook.Workbook.Names.push({
    Name: tableName,
    Ref: `'${sheetName}'!${finalRange}`,
  });

  const saved = saveWorkbook(workbook, resolved);

  return {
    file: saved,
    sheetName,
    tableName,
    range: finalRange,
    note: "Created as Named Range (simple table representation).",
  };
}