// excel/functions/excel_describe_sheets.ts
import { loadWorkbook } from "../utils/excelHelpers";
import * as xlsx from "xlsx";
import { z } from "zod";
import { ExcelDescribeSheetsSchema } from "../types";

/**
 * excel_describe_sheets
 * List semua sheet + range !ref.
 */
export function excel_describe_sheets(args: z.infer<typeof ExcelDescribeSheetsSchema>) {
  const { fileAbsolutePath } = ExcelDescribeSheetsSchema.parse(args);
  const { workbook, resolved } = loadWorkbook(fileAbsolutePath);

  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    return {
      sheetName: name,
      range: sheet["!ref"] || null,
    };
  });

  return {
    file: resolved,
    sheets,
  };
}