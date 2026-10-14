// excel/functions/excel_write_to_sheet.ts
import { loadWorkbook, saveWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { ExcelWriteToSheetSchema } from "../types";

/**
 * Membangun objek sel xlsx dengan tipe (t) yang benar.
 * Tanpa properti `t`, angka dapat terbaca kembali sebagai string.
 */
function buildCell(val: any): xlsx.CellObject | null {
  if (typeof val === "string" && val.startsWith("=")) {
    return { t: "n", f: val.slice(1) }; // formula tanpa '='
  }
  if (typeof val === "number") return { t: "n", v: val };
  if (typeof val === "boolean") return { t: "b", v: val };
  if (val instanceof Date) return { t: "d", v: val };
  if (val === null || val === undefined) return null; // biarkan sel kosong
  return { t: "s", v: String(val) };
}

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

  let maxColWritten = 0;

  values.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      const addr = xlsx.utils.encode_cell({
        r: startRow + rIdx,
        c: startCol + cIdx,
      });

      const cell = buildCell(val);
      if (cell === null) {
        delete sheet[addr];
        return;
      }
      sheet[addr] = cell;
      if (cIdx + 1 > maxColWritten) maxColWritten = cIdx + 1;
    });
  });

  // Perluas !ref agar tidak memotong data yang sudah ada di sheet.
  const endRow = startRow + values.length - 1;
  const endCol = startCol + maxColWritten - 1;

  let rangeObj: xlsx.Range = {
    s: { r: startRow, c: startCol },
    e: { r: Math.max(startRow, endRow), c: Math.max(startCol, endCol) },
  };

  if (sheet["!ref"]) {
    const old = xlsx.utils.decode_range(sheet["!ref"]);
    rangeObj = {
      s: {
        r: Math.min(old.s.r, rangeObj.s.r),
        c: Math.min(old.s.c, rangeObj.s.c),
      },
      e: {
        r: Math.max(old.e.r, rangeObj.e.r),
        c: Math.max(old.e.c, rangeObj.e.c),
      },
    };
  }

  sheet["!ref"] = xlsx.utils.encode_range(rangeObj);

  const saved = saveWorkbook(workbook, resolved);

  return {
    file: saved,
    sheetName,
    range,
    writtenRows: values.length,
  };
}