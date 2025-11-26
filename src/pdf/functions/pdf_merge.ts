// pdf/functions/pdf_merge.ts
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { PdfMergeSchema } from "../types";

/**
 * pdf_merge
 * Merges multiple PDF files into a single output PDF.
 * - inputFiles: An array of absolute paths to the PDF files to merge.
 * - outputFile: The absolute path for the merged output PDF file.
 */
export async function pdf_merge(args: z.infer<typeof PdfMergeSchema>) {
  const { fileAbsolutePaths, outputFilePath } = PdfMergeSchema.parse(args);

  const mergedPdf = await PDFDocument.create();

  for (const inputFile of fileAbsolutePaths) {
    const resolvedInputFile = path.resolve(inputFile);
    if (!fs.existsSync(resolvedInputFile)) {
      throw new Error(`Input PDF file not found: ${resolvedInputFile}`);
    }
    const pdfBytes = fs.readFileSync(resolvedInputFile);
    const pdfToCopy = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdfToCopy, pdfToCopy.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const resolvedOutputFilePath = path.resolve(outputFilePath);
  fs.writeFileSync(resolvedOutputFilePath, mergedPdfBytes);

  return {
    inputFiles: fileAbsolutePaths.map(file => path.resolve(file)),
    outputFile: resolvedOutputFilePath,
    note: `Successfully merged ${fileAbsolutePaths.length} PDF files into ${outputFilePath}.`,
  };
}