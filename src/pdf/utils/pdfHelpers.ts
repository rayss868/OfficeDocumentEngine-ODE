// pdf/utils/pdfHelpers.ts
import * as fs from "fs";
import * as path from "path";
import { PDFDocument } from "pdf-lib";
const pdfParse = require("pdf-parse");

export async function loadPdf(fileAbsolutePath: string) {
  const resolved = path.resolve(fileAbsolutePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`PDF file not found: ${resolved}`);
  }
  const dataBuffer = fs.readFileSync(resolved);
  return { dataBuffer, resolved };
}

export async function loadPdfLibDoc(fileAbsolutePath: string) {
  const resolved = path.resolve(fileAbsolutePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`PDF file not found: ${resolved}`);
  }
  const existingPdfBytes = fs.readFileSync(resolved);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return { pdfDoc, resolved };
}

export const PDFParser = (dataBuffer: Buffer) => pdfParse(dataBuffer);