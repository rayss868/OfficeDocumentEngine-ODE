// docx/functions/docx_get_metadata.ts
import { loadDocx, extractXmlFromDocx } from '../utils/docxHelpers';
import { DOMParser } from 'xmldom'; // For parsing XML
import { z } from "zod";
import { DocxGetMetadataSchema } from "../types";

/**
 * Extracts metadata from a DOCX file.
 * DOCX metadata is typically found in 'docProps/core.xml' and 'docProps/app.xml' within the zip archive.
 * @param args - The parameters for the function, validated by DocxGetMetadataSchema.
 * @returns An object containing extracted metadata.
 */
export function docx_get_metadata(args: z.infer<typeof DocxGetMetadataSchema>) {
  const { fileAbsolutePath } = DocxGetMetadataSchema.parse(args);
  const resolvedPath = loadDocx(fileAbsolutePath);
  const metadata: { [key: string]: any } = {
    file: resolvedPath,
    title: null,
    subject: null,
    creator: null,
    keywords: null,
    description: null,
    lastModifiedBy: null,
    revision: null,
    created: null,
    modified: null,
    category: null,
    contentType: null,
    version: null,
    pages: null, // from app.xml
    words: null, // from app.xml
    characters: null, // from app.xml
  };

  // --- Extract from docProps/core.xml ---
  const coreXmlContent = extractXmlFromDocx(resolvedPath, 'docProps/core.xml');
  if (coreXmlContent) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(coreXmlContent, 'application/xml');
      const getTagValue = (tagName: string) => {
        const tag = doc.getElementsByTagName(tagName)[0];
        return tag ? tag.textContent : null;
      };

      metadata.title = getTagValue('dc:title');
      metadata.subject = getTagValue('dc:subject');
      metadata.creator = getTagValue('dc:creator');
      metadata.keywords = getTagValue('cp:keywords');
      metadata.description = getTagValue('dc:description');
      metadata.lastModifiedBy = getTagValue('cp:lastModifiedBy');
      metadata.revision = getTagValue('cp:revision');
      metadata.created = getTagValue('dcterms:created');
      metadata.modified = getTagValue('dcterms:modified');
      metadata.category = getTagValue('cp:category');
      metadata.contentType = getTagValue('cp:contentType');

    } catch (error: any) {
      console.warn(`Warning: Failed to parse docProps/core.xml for ${resolvedPath}:`, error.message);
    }
  }

  // --- Extract from docProps/app.xml ---
  const appXmlContent = extractXmlFromDocx(resolvedPath, 'docProps/app.xml');
  if (appXmlContent) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(appXmlContent, 'application/xml');
      const getTagValue = (tagName: string) => {
        const tag = doc.getElementsByTagName(tagName)[0];
        return tag ? tag.textContent : null;
      };
      
      metadata.pages = parseInt(getTagValue('Pages') || '') || null;
      metadata.words = parseInt(getTagValue('Words') || '') || null;
      metadata.characters = parseInt(getTagValue('Characters') || '') || null;
      metadata.version = getTagValue('AppVersion');

    } catch (error: any) {
      console.warn(`Warning: Failed to parse docProps/app.xml for ${resolvedPath}:`, error.message);
    }
  }

  return metadata;
}