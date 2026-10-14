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
  const fileBuffer = fs.readFileSync(resolved);
  // pdf-parse (berbasis pdfjs) dapat gagal membaca Node Buffer pada Node versi
  // terbaru ("bad XRef entry"). Konversi ke Uint8Array membuat parsing berhasil.
  const dataBuffer = new Uint8Array(
    fileBuffer.buffer,
    fileBuffer.byteOffset,
    fileBuffer.byteLength
  );
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

/**
 * Mendeteksi apakah PDF memiliki lapisan teks asli.
 * PDF hasil scan/render canvas hanya berisi gambar tanpa font maupun operator
 * teks, sehingga ekstraksi teks selalu kosong. Deteksi dilakukan pada byte
 * mentah karena kamus resource halaman umumnya tidak terkompresi.
 */
export function hasTextLayer(dataBuffer: Uint8Array): boolean {
  const raw = Buffer.from(dataBuffer).toString("latin1");
  return /\/Font\b/.test(raw) || /\/ToUnicode\b/.test(raw);
}

export const PDFParser = (dataBuffer: Uint8Array) => pdfParse(dataBuffer);