// excel/functions/excel_read_sheet.ts
import { loadWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import { z } from "zod";
import { ExcelReadSheetSchema } from "../types";

/**
 * excel_read_sheet
 * Baca nilai dari sheet (optional range).
 * - showFormula: jika true, akan mengembalikan "=SUM(A1:A3)" dsb jika ada.
 * - showStyle: jika true, tiap sel berupa object { value, formula, style }
 */
export function excel_read_sheet(args: z.infer<typeof ExcelReadSheetSchema>) {
  const {
    fileAbsolutePath,
    sheetName,
    range,
    showFormula = false,
    showStyle = false,
  } = ExcelReadSheetSchema.parse(args);

  const { workbook } = loadWorkbook(fileAbsolutePath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  const finalRange = range || sheet["!ref"];
  if (!finalRange) {
    return { sheetName, range: null, rows: [] };
  }

  const decoded = xlsx.utils.decode_range(finalRange);
  const rows: (any[] | { value: any; formula: string | null; style: any }[][]) = [];

  for (let r = decoded.s.r; r <= decoded.e.r; r++) {
    const row: (any | { value: any; formula: string | null; style: any })[] = [];
    for (let c = decoded.s.c; c <= decoded.e.c; c++) {
      const addr = xlsx.utils.encode_cell({ r, c });
      const cell = sheet[addr];

      let value: any = null;
      let formula: string | null = null;
      let style: any = null;

      if (cell) {
        if (showFormula && cell.f) {
          formula = "=" + cell.f;
          value = cell.v ?? null;
        } else {
          value = cell.v ?? null;
          if (cell.f) formula = "=" + cell.f;
        }
        if (showStyle && cell.s) {
          style = cell.s; // langsung dump style object dari xlsx
        }
      }

      if (showStyle) {
        row.push({ value, formula, style });
      } else if (showFormula) {
        row.push(formula || value);
      } else {
        row.push(value);
      }
    }
    rows.push(row);
  }

  return {
    sheetName,
    range: finalRange,
    rows,
  };
}