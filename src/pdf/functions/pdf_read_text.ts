// pdf/functions/pdf_read_text.ts
import { loadPdf, PDFParser, hasTextLayer } from "../utils/pdfHelpers";
import { z } from "zod";
import { PdfReadTextSchema } from "../types";

/**
 * pdf_read_text
 * Reads text from the entire PDF.
 * Note: pdf-parse reads all pages at once. The `pageNumbers` parameter is acknowledged
 * but currently has no effect on filtering output, as pdf-parse returns all text.
 * - pageNumbers: (Optional) array of page numbers (1-indexed) to read.
 */
export async function pdf_read_text(args: z.infer<typeof PdfReadTextSchema>) {
  const { fileAbsolutePath, pageNumbers } = PdfReadTextSchema.parse(args);
  const { dataBuffer, resolved } = await loadPdf(fileAbsolutePath);

  const data = await PDFParser(dataBuffer);
  const totalPages = data.numpages;

  let textToReturn = data.text;

  if (pageNumbers && pageNumbers.length > 0) {
    console.warn("pdf_read_text with pdf-parse currently reads all text and cannot filter by page numbers directly. Returning all text.");
  }

  const isImageOnly = !hasTextLayer(dataBuffer);

  const result: {
    file: string;
    totalPages: number;
    text: string;
    isImageOnly: boolean;
    note?: string;
  } = {
    file: resolved,
    totalPages,
    text: textToReturn,
    isImageOnly,
  };

  if (isImageOnly) {
    result.note =
      "This PDF has no text layer: its pages are images (scanned or canvas-rendered), so there is no extractable text.";
  }

  return result;
}