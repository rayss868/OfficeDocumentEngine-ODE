// pdf/functions/pdf_extract_pages.ts
import { loadPdfLibDoc } from "../utils/pdfHelpers";
import * as path from "path";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import { PdfExtractPagesSchema } from "../types";
import * as fs from "fs";

/**
 * pdf_extract_pages
 * Extracts specified pages from a PDF and saves them to a new PDF file.
 * - pages: array of page numbers (1-indexed) to extract.
 * - outputFilePath: absolute path to save the extracted PDF.
 */
export async function pdf_extract_pages(args: z.infer<typeof PdfExtractPagesSchema>) {
  const { fileAbsolutePath, pages, outputFilePath } = PdfExtractPagesSchema.parse(args);
  const { pdfDoc, resolved } = await loadPdfLibDoc(fileAbsolutePath);
  
  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, pages.map(p => p - 1)); // pdf-lib is 0-indexed
  copiedPages.forEach((page) => newPdfDoc.addPage(page));

  const pdfBytes = await newPdfDoc.save();
  const resolvedOutputFilePath = path.resolve(outputFilePath);
  fs.writeFileSync(resolvedOutputFilePath, pdfBytes);

  return {
    sourceFile: resolved,
    outputFile: resolvedOutputFilePath,
    extractedPages: pages,
    message: `Successfully extracted pages ${pages.join(', ')} to ${resolvedOutputFilePath}`,
  };
}