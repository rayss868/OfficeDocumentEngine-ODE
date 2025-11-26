// excel/functions/excel_extract_images.ts
import { loadWorkbook } from "../utils/excelHelpers";
import * as fs from "fs";
import * as path from "path";
import * as JSZip from "jszip";
import { z } from "zod";
import { ExcelExtractImagesSchema } from "../types";

/**
* excel_extract_images
* Extract all images from an Excel file.
* Images are stored in the xl/media/ directory within the .xlsx file.
*/
export async function excel_extract_images(args: z.infer<typeof ExcelExtractImagesSchema>) {
  const { fileAbsolutePath, outputDirectory } = ExcelExtractImagesSchema.parse(args);
  const { resolved: resolvedFile } = loadWorkbook(fileAbsolutePath); // Use loadWorkbook to check file existence
  
  const resolvedOutput = path.resolve(outputDirectory);
  if (!fs.existsSync(resolvedOutput)) {
    fs.mkdirSync(resolvedOutput, { recursive: true });
  }

  const fileBuffer = fs.readFileSync(resolvedFile);
  const zip = await JSZip.loadAsync(fileBuffer);

  const imageFiles: string[] = [];
  const mediaFolder = 'xl/media/';

  // Find all files in the xl/media/ folder
  for (const [fileName, fileData] of Object.entries(zip.files)) {
    if (fileName.startsWith(mediaFolder) && !fileName.endsWith('/')) {
      const imageBuffer = await fileData.async('nodebuffer');
      const outputPath = path.join(resolvedOutput, fileName.replace(mediaFolder, ''));
      fs.writeFileSync(outputPath, imageBuffer);
      imageFiles.push(outputPath);
    }
  }

  return {
    file: resolvedFile,
    outputDirectory: resolvedOutput,
    imagesExtracted: imageFiles.length,
    imagePaths: imageFiles,
  };
}