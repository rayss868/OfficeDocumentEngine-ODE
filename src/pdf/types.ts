import { z } from "zod";

export const PdfReadTextShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file to be read. IMPORTANT: This function uses the 'pdf-parse' library and is INCOMPATIBLE with PDFs created by this engine's modification tools (e.g., pdf_create_dummy, pdf_merge). Use only on external, standard PDFs."),
  pageNumbers: z.array(z.number().int().min(1)).optional().describe("Optional. An array of 1-indexed page numbers to read. Note: The underlying 'pdf-parse' library does not support selective page reading and will always process the entire document. This parameter is for future compatibility and does not currently affect the output."),
};
export const PdfReadTextSchema = z.object(PdfReadTextShape);

export const PdfGetMetadataShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file for which to retrieve metadata. IMPORTANT: This function uses the 'pdf-parse' library and is INCOMPATIBLE with PDFs created by this engine's modification tools (e.g., pdf_create_dummy, pdf_merge). Use only on external, standard PDFs."),
};
export const PdfGetMetadataSchema = z.object(PdfGetMetadataShape);

export const PdfExtractPagesShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the source PDF file from which pages will be extracted."),
  pages: z.array(z.number().int().min(1)).describe("An array of 1-indexed page numbers to extract from the source file. Example: [1, 3, 5]"),
  outputFilePath: z.string().describe("The absolute path where the new PDF with the extracted pages will be saved."),
};
export const PdfExtractPagesSchema = z.object(PdfExtractPagesShape);

export const PdfSearchTextShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file to be searched. IMPORTANT: This function uses the 'pdf-parse' library and is INCOMPATIBLE with PDFs created by this engine's modification tools. Use only on external, standard PDFs."),
  searchText: z.string().describe("The text string to search for within the PDF content."),
  caseSensitive: z.boolean().optional().default(false).describe("Optional. If true, the search will be case-sensitive. Defaults to false."),
};
export const PdfSearchTextSchema = z.object(PdfSearchTextShape);

export const PdfMergeShape = {
  fileAbsolutePaths: z.array(z.string()).min(2, { message: "Must provide at least two PDF files to merge." }).describe("An array of absolute paths to the PDF files to be merged. Requires at least two files."),
  outputFilePath: z.string().describe("The absolute path where the newly merged PDF will be saved."),
};
export const PdfMergeSchema = z.object(PdfMergeShape);

export const PdfSplitShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file that will be split into two parts."),
  pageNumber: z.number().int().min(1).describe("The 1-indexed page number that will serve as the split point. Pages before this number go into the first file, and pages from this number onward go into the second file."),
  outputFilePathPart1: z.string().describe("The absolute path for the first output file (containing pages before the split point)."),
  outputFilePathPart2: z.string().describe("The absolute path for the second output file (containing pages from the split point onwards)."),
};
export const PdfSplitSchema = z.object(PdfSplitShape);

export const PdfRotatePagesShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file in which pages will be rotated."),
  pages: z.array(z.number().int().min(1)).describe("An array of 1-indexed page numbers to rotate."),
  rotationAngle: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).describe("The angle of rotation in degrees. Must be one of: 0, 90, 180, 270."),
  outputFilePath: z.string().describe("The absolute path where the output PDF with the rotated pages will be saved."),
};
export const PdfRotatePagesSchema = z.object(PdfRotatePagesShape);

export const PdfGetTextPositionsShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the PDF file. IMPORTANT: This function uses 'pdf-parse' and is INCOMPATIBLE with PDFs from this engine's modification tools."),
  pageNumber: z.number().int().min(1).describe("The 1-indexed page number from which to retrieve text and its X/Y positions."),
};
export const PdfGetTextPositionsSchema = z.object(PdfGetTextPositionsShape);

export const PdfCreateDummyShape = {
  fileAbsolutePath: z.string().describe("The absolute path where the new dummy PDF file will be created."),
  textContent: z.string().optional().describe("Optional. The text content to write into the new PDF file."),
};
export const PdfCreateDummySchema = z.object(PdfCreateDummyShape);