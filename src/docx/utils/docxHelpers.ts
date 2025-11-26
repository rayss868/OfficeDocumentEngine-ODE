// docx/utils/docxHelpers.ts
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth'; // Mammoth.js for DOCX to HTML/Text conversion
import AdmZip from 'adm-zip'; // To extract XML files from DOCX for metadata

/**
 * Loads a DOCX file and returns its absolute path.
 * @param fileAbsolutePath - The absolute path to the DOCX file.
 * @returns The resolved absolute path of the DOCX file.
 * @throws {Error} If the DOCX file is not found.
 */
export function loadDocx(fileAbsolutePath: string): string {
  const resolved = path.resolve(fileAbsolutePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`DOCX file not found: ${resolved}`);
  }
  return resolved;
}

/**
 * Extracts the raw XML content of a specified file from within a DOCX archive.
 * DOCX files are essentially ZIP archives containing XML files.
 * @param docxFilePath - The absolute path to the DOCX file.
 * @param internalFilePath - The path to the file within the DOCX archive (e.g., 'docProps/core.xml').
 * @returns The content of the internal file as a string, or null if not found.
 */
export function extractXmlFromDocx(docxFilePath: string, internalFilePath: string): string | null {
  const resolvedPath = loadDocx(docxFilePath);
  try {
    const zip = new AdmZip(resolvedPath);
    const zipEntries = zip.getEntries();
    const entry = zipEntries.find(e => e.entryName === internalFilePath);
    if (entry) {
      return entry.getData().toString('utf8');
    }
    return null;
  } catch (error: any) {
    console.error(`Error extracting ${internalFilePath} from ${docxFilePath}:`, error.message);
    return null;
  }
}

export { mammoth }; // Export mammoth for direct use in functions