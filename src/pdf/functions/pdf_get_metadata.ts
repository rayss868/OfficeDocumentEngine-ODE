// pdf/functions/pdf_get_metadata.ts
import { loadPdf, PDFParser } from "../utils/pdfHelpers";
import { z } from "zod";
import { PdfGetMetadataSchema } from "../types";

/**
 * pdf_get_metadata
 * Retrieves metadata from a PDF (info.author, info.creator, etc.).
 */
export async function pdf_get_metadata(args: z.infer<typeof PdfGetMetadataSchema>) {
  const { fileAbsolutePath } = PdfGetMetadataSchema.parse(args);
  const { dataBuffer, resolved } = await loadPdf(fileAbsolutePath);
  const data = await PDFParser(dataBuffer);

  return {
    file: resolved,
    metadata: data.info || {},
  };
}