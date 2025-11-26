import { z } from "zod";

export const ExcelDescribeSheetsShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook (.xlsx, .xls, etc.). This is a required parameter."),
};
export const ExcelDescribeSheetsSchema = z.object(ExcelDescribeSheetsShape);

export const ExcelReadSheetShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook."),
  sheetName: z.string().describe("The name of the sheet from which to read data. Must be an existing sheet."),
  range: z.string().optional().describe("Optional. A specific range to read from (e.g., 'A1:C10'). If not provided, the entire used range of the sheet will be read."),
  showFormula: z.boolean().optional().default(false).describe("Optional. If true, cells with formulas will return the formula string (e.g., '=SUM(A1:A3)') instead of the calculated value. Defaults to false."),
  showStyle: z.boolean().optional().default(false).describe("Optional. If true, each cell is returned as an object containing its value, formula, and style information: { value, formula, style }. Defaults to false."),
};
export const ExcelReadSheetSchema = z.object(ExcelReadSheetShape);

export const ExcelWriteToSheetShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook. If the file does not exist, it will be created."),
  sheetName: z.string().describe("The name of the sheet to write to. If it doesn't exist, it will be created."),
  newSheet: z.boolean().optional().default(false).describe("Optional. If true, a new sheet with the given name will be created, overwriting any existing sheet with the same name. Defaults to false."),
  range: z.string().describe("The starting cell for the write operation (e.g., 'A1', 'B3'). Data will be written from this cell downwards and to the right."),
  values: z.array(z.array(z.any())).describe("A 2D array of data to write. Each inner array represents a row, and its elements represent the cells in that row."),
};
export const ExcelWriteToSheetSchema = z.object(ExcelWriteToSheetShape);

export const ExcelCopySheetShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook."),
  srcSheetName: z.string().describe("The name of the existing sheet to be copied."),
  dstSheetName: z.string().describe("The name for the new copied sheet. The command will fail if a sheet with this name already exists."),
};
export const ExcelCopySheetSchema = z.object(ExcelCopySheetShape);

export const ExcelCreateTableShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook."),
  sheetName: z.string().describe("The name of the sheet where the table will be created."),
  range: z.string().optional().describe("Optional. The cell range to be defined as a table (e.g., 'A1:D20'). If not provided, the entire sheet's used range will be used."),
  tableName: z.string().describe("The name to assign to the new table. This is implemented by creating a 'Named Range' in the workbook."),
};
export const ExcelCreateTableSchema = z.object(ExcelCreateTableShape);

export const ExcelFormatRangeShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook."),
  sheetName: z.string().describe("The name of the sheet containing the range to format."),
  range: z.string().describe("The cell range to which the styles will be applied (e.g., 'A1:B5')."),
  styles: z.array(z.array(z.any())).describe("A 2D array of style objects, matching the dimensions of the specified range. Use 'null' for cells you wish to skip. The style object is passed directly to the 'xlsx' library."),
};
export const ExcelFormatRangeSchema = z.object(ExcelFormatRangeShape);

export const ExcelExtractImagesShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook from which to extract images."),
  outputDirectory: z.string().describe("The absolute path to the directory where the extracted image files will be saved."),
};
export const ExcelExtractImagesSchema = z.object(ExcelExtractImagesShape);

export const ExcelScreenCaptureShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the Excel workbook."),
  sheetName: z.string().optional().describe("Optional. The name of the sheet to capture. If not provided, the currently active sheet is assumed."),
  range: z.string().optional().describe("Optional. A specific range to capture (e.g., 'A1:C10'). If not provided, the entire visible area of the sheet is assumed."),
};
export const ExcelScreenCaptureSchema = z.object(ExcelScreenCaptureShape);