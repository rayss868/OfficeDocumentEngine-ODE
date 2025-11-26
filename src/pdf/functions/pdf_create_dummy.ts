// pdf/functions/pdf_create_dummy.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { PdfCreateDummySchema } from "../types";

/**
 * pdf_create_dummy
 * Creates a simple dummy PDF file with specified text and saves it.
 */
export async function pdf_create_dummy(args: z.infer<typeof PdfCreateDummySchema>) {
  const { fileAbsolutePath, textContent = "This is a dummy PDF file created by Office Document Engine." } = PdfCreateDummySchema.parse(args);
  const resolvedOutputFilePath = path.resolve(fileAbsolutePath);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(textContent, {
    x: 50,
    y: page.getHeight() - 50,
    font,
    size: 24,
    color: rgb(0.98, 0.34, 0.11),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(resolvedOutputFilePath, pdfBytes);

  return {
    fileAbsolutePath: resolvedOutputFilePath,
    message: "Dummy PDF created successfully.",
  };
}