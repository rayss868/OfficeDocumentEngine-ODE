// pdf/functions/pdf_rotate_pages.ts
import { loadPdfLibDoc } from "../utils/pdfHelpers";
import { PDFDocument, degrees } from 'pdf-lib';
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { PdfRotatePagesSchema } from "../types";

/**
 * pdf_rotate_pages
 * Rotates specified pages within a PDF document.
 * - fileAbsolutePath: The absolute path to the input PDF file.
 * - pages: An array of 1-indexed page numbers to rotate.
 * - rotationAngle: Rotation angle in degrees (0, 90, 180, or 270).
 * - outputFilePath: The absolute path for the output PDF file with rotated pages.
 */
export async function pdf_rotate_pages(args: z.infer<typeof PdfRotatePagesSchema>) {
  const { fileAbsolutePath, pages, rotationAngle, outputFilePath } = PdfRotatePagesSchema.parse(args);
  const { pdfDoc, resolved: resolvedInputFile } = await loadPdfLibDoc(fileAbsolutePath);
  
  const totalPages = pdfDoc.getPageCount();

  for (const pageNumber of pages) {
    if (pageNumber < 1 || pageNumber > totalPages) {
      console.warn(`Invalid page number ${pageNumber}. Skipping rotation for this page.`);
      continue;
    }
    
    const page = pdfDoc.getPage(pageNumber - 1); // pdf-lib uses 0-indexed pages
    page.setRotation(degrees(rotationAngle));
  }

  const rotatedPdfBytes = await pdfDoc.save();
  const resolvedOutputFilePath = path.resolve(outputFilePath);
  fs.writeFileSync(resolvedOutputFilePath, rotatedPdfBytes);

  return {
    sourceFile: resolvedInputFile,
    outputFile: resolvedOutputFilePath,
    pagesRotated: pages,
    rotationAngle,
    message: `Successfully applied ${rotationAngle} degree rotation to pages ${pages.join(', ')}.`,
  };
}