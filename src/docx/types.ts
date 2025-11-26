import { z } from "zod";

export const DocxReadTextShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the DOCX file (.docx) from which to read the text content."),
};
export const DocxReadTextSchema = z.object(DocxReadTextShape);

export const DocxGetMetadataShape = {
  fileAbsolutePath: z.string().describe("The absolute path to the DOCX file (.docx) from which to retrieve metadata."),
};
export const DocxGetMetadataSchema = z.object(DocxGetMetadataShape);