// excel/functions/excel_write_to_sheet.ts
import { loadWorkbook, saveWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { ExcelWriteToSheetSchema } from "../types";

/**
 * excel_write_to_sheet
 * Menulis 2D array ke range tertentu.
 * - values: array of array (baris x kolom)
 * - newSheet: jika true, buat sheet baru (overwrite jika sudah ada)
 */
export function excel_write_to_sheet(args: z.infer<typeof ExcelWriteToSheetSchema>) {
  const {
    fileAbsolutePath,
    sheetName,
    newSheet,
    range,
    values,
  } = ExcelWriteToSheetSchema.parse(args);

  const resolved = path.resolve(fileAbsolutePath);

  let workbook: xlsx.WorkBook;
  if (fs.existsSync(resolved)) {
    workbook = xlsx.readFile(resolved);
  } else {
    workbook = xlsx.utils.book_new();
  }

  let sheet = workbook.Sheets[sheetName];

  if (!sheet || newSheet) {
    sheet = xlsx.utils.aoa_to_sheet([]);
    // kalau sudah ada dan newSheet=true, replace
    const existingIndex = workbook.SheetNames.indexOf(sheetName);
    if (existingIndex === -1) {
      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    } else {
      workbook.Sheets[sheetName] = sheet;
    }
  }

  const decoded = xlsx.utils.decode_range(range);
  const startRow = decoded.s.r;
  const startCol = decoded.s.c;

  values.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      const addr = xlsx.utils.encode_cell({
        r: startRow + rIdx,
        c: startCol + cIdx,
      });

      if (typeof val === "string" && val.startsWith("=")) {
        sheet[addr] = { t: "n", f: val.slice(1) }; // formula tanpa '='
      } else {
        sheet[addr] = { v: val };
      }
    });
  });

  // update !ref
  const endRow = startRow + values.length - 1;
  const endCol = startCol + (values[0]?.length || 0) - 1;
  sheet["!ref"] =
    xlsx.utils.encode_cell({ r: startRow, c: startCol }) +
    ":" +
    xlsx.utils.encode_cell({ r: endRow, c: endCol });

  const saved = saveWorkbook(workbook, resolved);

  return {
    file: saved,
    sheetName,
    range,
    writtenRows: values.length,
  };
}