// docx/functions/docx_read_text.ts
import { loadDocx, mammoth } from '../utils/docxHelpers';
import { z } from "zod";
import { DocxReadTextSchema } from "../types";

/**
 * Reads the text content from a DOCX file.
 * @param args - The arguments for the function, validated by DocxReadTextSchema.
 * @returns An object containing the extracted text.
 */
export async function docx_read_text(args: z.infer<typeof DocxReadTextSchema>) {
  const { fileAbsolutePath } = DocxReadTextSchema.parse(args);
  const resolvedPath = loadDocx(fileAbsolutePath);

  try {
    const result = await mammoth.extractRawText({ path: resolvedPath });
    const text = result.value; // The raw text
    // const messages = result.messages; // Any warning messages

    return {
      file: resolvedPath,
      text: text,
      // warnings: messages,
    };
  } catch (error: any) {
    throw new Error(`Failed to read text from DOCX file: ${error.message}`);
  }
}