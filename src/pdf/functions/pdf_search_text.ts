// pdf/functions/pdf_search_text.ts
import { loadPdf, PDFParser } from "../utils/pdfHelpers";
import { z } from "zod";
import { PdfSearchTextSchema } from "../types";

/**
 * pdf_search_text
 * Searches for text within the PDF and returns matches with context.
 * Note: pdf-parse provides all text, so the search is performed on the full document text.
 * - searchText: the text to search for.
 * - caseSensitive: (Optional) boolean indicating if the search should be case sensitive.
 */
export async function pdf_search_text(args: z.infer<typeof PdfSearchTextSchema>) {
  const { fileAbsolutePath, searchText, caseSensitive = false } = PdfSearchTextSchema.parse(args);
  const { dataBuffer, resolved } = await loadPdf(fileAbsolutePath);
  
  const data = await PDFParser(dataBuffer);
  const fullText = data.text;
  
  let searchInText = fullText;
  let searchFor = searchText;
  
  if (!caseSensitive) {
    searchInText = searchInText.toLowerCase();
    searchFor = searchFor.toLowerCase();
  }
  
  const matches: { index: number; context: string }[] = [];
  let startIndex = 0;
  while (startIndex < searchInText.length) {
    const index = searchInText.indexOf(searchFor, startIndex);
    if (index === -1) break;
    
    matches.push({
      index: index,
      context: fullText.substring(Math.max(0, index - 50), index + searchFor.length + 50),
    });
    
    // Move past the found text to find subsequent occurrences
    startIndex = index + searchFor.length;
  }
  
  // pdf-parse does not provide page numbers for text matches directly.
  return {
    file: resolved,
    searchText,
    caseSensitive,
    totalMatches: matches.length,
    matches: matches, // Returning matches with context
    note: "Page number for matches not directly available with pdf-parse's basic text extraction. Returning all matches in document context.",
  };
}