// pdf/functions/pdf_split.ts
import { loadPdfLibDoc } from "../utils/pdfHelpers";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { PdfSplitSchema } from "../types";

/**
 * pdf_split
 * Splits a PDF file into two new PDF files at a specified page number.
 * - pageNumber: The 1-indexed page number at which to split the PDF.
 * - outputFilePathPart1: Absolute path for the first output PDF file (pages before split).
 * - outputFilePathPart2: Absolute path for the second output PDF file (pages from split point onwards).
 */
export async function pdf_split(args: z.infer<typeof PdfSplitSchema>) {
  const { fileAbsolutePath, pageNumber, outputFilePathPart1, outputFilePathPart2 } = PdfSplitSchema.parse(args);
  const { pdfDoc: originalPdf, resolved: resolvedInputFile } = await loadPdfLibDoc(fileAbsolutePath);
  
  const totalPages = originalPdf.getPageCount();

  if (pageNumber < 1 || pageNumber > totalPages) {
    throw new Error(`Page number for split (${pageNumber}) is out of bounds (1-${totalPages}).`);
  }

  // Part 1: Pages before the split point
  const pdfPart1 = await PDFDocument.create();
  const copiedPages1 = await pdfPart1.copyPages(originalPdf, Array.from({ length: pageNumber - 1 }, (_, i) => i));
  copiedPages1.forEach((page) => pdfPart1.addPage(page));
  const pdfBytesPart1 = await pdfPart1.save();
  const resolvedOutputFilePathPart1 = path.resolve(outputFilePathPart1);
  fs.writeFileSync(resolvedOutputFilePathPart1, pdfBytesPart1);

  // Part 2: Pages from the split point onwards
  const pdfPart2 = await PDFDocument.create();
  const copiedPages2 = await pdfPart2.copyPages(originalPdf, Array.from({ length: totalPages - pageNumber + 1 }, (_, i) => i + pageNumber - 1));
  copiedPages2.forEach((page) => pdfPart2.addPage(page));
  const pdfBytesPart2 = await pdfPart2.save();
  const resolvedOutputFilePathPart2 = path.resolve(outputFilePathPart2);
  fs.writeFileSync(resolvedOutputFilePathPart2, pdfBytesPart2);

  return {
    sourceFile: resolvedInputFile,
    splitPage: pageNumber,
    outputFilePart1: resolvedOutputFilePathPart1,
    outputFilePart2: resolvedOutputFilePathPart2,
    message: `Successfully split PDF at page ${pageNumber} into two files.`,
  };
}