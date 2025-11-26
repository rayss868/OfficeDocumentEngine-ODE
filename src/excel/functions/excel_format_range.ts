// excel/functions/excel_format_range.ts
import { loadWorkbook, saveWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import { z } from "zod";
import { ExcelFormatRangeSchema } from "../types";

/**
 * excel_format_range
 * Terapkan style ke range.
 * - styles: 2D array (baris x kolom) of style object atau null.
 *   Style object langsung di-assign ke cell.s (apa adanya).
 */
export function excel_format_range(args: z.infer<typeof ExcelFormatRangeSchema>) {
  const { fileAbsolutePath, sheetName, range, styles } = ExcelFormatRangeSchema.parse(args);
  const { workbook, resolved } = loadWorkbook(fileAbsolutePath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

  const decoded = xlsx.utils.decode_range(range);

  const rowCount = decoded.e.r - decoded.s.r + 1;
  const colCount = decoded.e.c - decoded.s.c + 1;

  if (
    !Array.isArray(styles) ||
    styles.length !== rowCount ||
    styles.some(
      (row: any) => !Array.isArray(row) || row.length !== colCount
    )
  ) {
    throw new Error(
      `styles harus 2D array dengan ukuran ${rowCount} x ${colCount}`
    );
  }

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const style = styles[r][c];
      if (!style) continue;

      const addr = xlsx.utils.encode_cell({
        r: decoded.s.r + r,
        c: decoded.s.c + c,
      });

      if (!sheet[addr]) sheet[addr] = { v: null };
      sheet[addr].s = style;
    }
  }

  const saved = saveWorkbook(workbook, resolved);

  return {
    file: saved,
    sheetName,
    range,
    note:
      "Styles applied. Pastikan viewer Excel mendukung styling dari library xlsx.",
  };
}