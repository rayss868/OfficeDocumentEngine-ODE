#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Excel Imports
import * as excel from "./excel";
import {
  ExcelDescribeSheetsSchema,
  ExcelReadSheetSchema,
  ExcelWriteToSheetSchema,
  ExcelCopySheetSchema,
  ExcelCreateTableSchema,
  ExcelFormatRangeSchema,
  ExcelExtractImagesSchema,
} from "./excel/types";

// PDF Imports
import * as pdf from "./pdf";
import {
  PdfReadTextSchema,
  PdfGetMetadataSchema,
  PdfExtractPagesSchema,
  PdfMergeSchema,
  PdfSplitSchema,
  PdfRotatePagesSchema,
  PdfSearchTextSchema,
  PdfGetTextPositionsSchema,
  PdfCreateDummySchema,
} from "./pdf/types";

// DOCX Imports
import * as docx from "./docx";
import {
  DocxReadTextSchema,
  DocxGetMetadataSchema,
} from "./docx/types";

class McpOfficeDocumentEngineServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "office-document-engine",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error: any) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    const toolDefinitions = [
      {
        name: "excel_describe_sheets",
        description: "Inspects an Excel workbook and returns a list of all sheets it contains, including their names and cell ranges. Example: {'fileAbsolutePath': 'C:/path/to/file.xlsx'}",
        inputSchema: ExcelDescribeSheetsSchema,
      },
      {
        name: "excel_read_sheet",
        description: "Reads data from a specific sheet in an Excel workbook. Can target a specific range. Example: {'fileAbsolutePath': 'C:/path/to/file.xlsx', 'sheetName': 'Sheet1', 'range': 'A1:C10'}",
        inputSchema: ExcelReadSheetSchema,
      },
      {
        name: "excel_write_to_sheet",
        description: "Writes a 2D array of data to a specified sheet and range. Can create new files or sheets. Example: {'fileAbsolutePath': './new.xlsx', 'sheetName': 'Data', 'range': 'A1', 'values': [['ID'], [1]]}",
        inputSchema: ExcelWriteToSheetSchema,
      },
      {
        name: "excel_copy_sheet",
        description: "Creates a duplicate of a sheet within the same workbook. Example: {'fileAbsolutePath': './file.xlsx', 'srcSheetName': 'Data', 'dstSheetName': 'Data_Copy'}",
        inputSchema: ExcelCopySheetSchema,
      },
      {
        name: "excel_create_table",
        description: "Defines a specified range as a 'table' by creating a Named Range in the workbook. Example: {'fileAbsolutePath': './file.xlsx', 'sheetName': 'Data', 'tableName': 'SalesTable', 'range': 'A1:D20'}",
        inputSchema: ExcelCreateTableSchema,
      },
      {
        name: "excel_format_range",
        description: "Applies cell styling (e.g., bold) to a specified range. Example: {'fileAbsolutePath': './file.xlsx', 'sheetName': 'Data', 'range': 'A1:C1', 'styles': [[{'font':{'bold':true}}]]}",
        inputSchema: ExcelFormatRangeSchema,
      },
      {
        name: "excel_extract_images",
        description: "Finds all images within an Excel file and saves them to a specified directory. Example: {'fileAbsolutePath': './file.xlsx', 'outputDirectory': './images'}",
        inputSchema: ExcelExtractImagesSchema,
      },
      {
        name: "pdf_read_text",
        description: "Extracts all text content from a PDF file. IMPORTANT: Incompatible with PDFs created by this engine's modification tools. Example: {'fileAbsolutePath': 'C:/path/to/report.pdf'}",
        inputSchema: PdfReadTextSchema,
      },
      {
        name: "pdf_get_metadata",
        description: "Retrieves metadata (Author, Creator, etc.) from a PDF file. IMPORTANT: Incompatible with PDFs created by this engine's modification tools. Example: {'fileAbsolutePath': 'C:/path/to/report.pdf'}",
        inputSchema: PdfGetMetadataSchema,
      },
      {
        name: "pdf_extract_pages",
        description: "Creates a new PDF containing a subset of pages from a source PDF. Example: {'fileAbsolutePath': './source.pdf', 'pages': [1, 3], 'outputFilePath': './extracted.pdf'}",
        inputSchema: PdfExtractPagesSchema,
      },
      {
        name: "pdf_merge",
        description: "Combines two or more separate PDF files into a single document. Example: {'fileAbsolutePaths': ['./file1.pdf', './file2.pdf'], 'outputFilePath': './merged.pdf'}",
        inputSchema: PdfMergeSchema,
      },
      {
        name: "pdf_split",
        description: "Splits a single PDF into two separate files at a specified page number. Example: {'fileAbsolutePath': './large.pdf', 'pageNumber': 5, 'outputFilePathPart1': './part1.pdf', 'outputFilePathPart2': './part2.pdf'}",
        inputSchema: PdfSplitSchema,
      },
      {
        name: "pdf_rotate_pages",
        description: "Rotates specified pages within a PDF by a given angle (90, 180, 270 degrees). Example: {'fileAbsolutePath': './file.pdf', 'pages': [1], 'rotationAngle': 90, 'outputFilePath': './rotated.pdf'}",
        inputSchema: PdfRotatePagesSchema,
      },
      {
        name: "pdf_search_text",
        description: "Performs a case-sensitive or insensitive search for a string within the PDF's text content. Example: {'fileAbsolutePath': './file.pdf', 'searchText': 'invoice'}",
        inputSchema: PdfSearchTextSchema,
      },
      {
        name: "pdf_get_text_positions",
        description: "Retrieves text and its X/Y positions from a specified page in a PDF file. Example: {'fileAbsolutePath': './file.pdf', 'pageNumber': 1}",
        inputSchema: PdfGetTextPositionsSchema,
      },
      {
        name: "pdf_create_dummy",
        description: "Generates a new, simple PDF file with specified text content. Example: {'fileAbsolutePath': './dummy.pdf', 'textContent': 'Hello World'}",
        inputSchema: PdfCreateDummySchema,
      },
      {
        name: "docx_read_text",
        description: "Extracts the full text content from a Microsoft Word (.docx) document. Example: {'fileAbsolutePath': 'C:/path/to/document.docx'}",
        inputSchema: DocxReadTextSchema,
      },
      {
        name: "docx_get_metadata",
        description: "Retrieves metadata from a .docx file, such as author and creation date. Example: {'fileAbsolutePath': 'C:/path/to/document.docx'}",
        inputSchema: DocxGetMetadataSchema,
      },
    ];

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      let result;

      try {
        switch (request.params.name) {
          case "excel_describe_sheets":
            result = await excel.excel_describe_sheets(ExcelDescribeSheetsSchema.parse(request.params.arguments));
            break;
          case "excel_read_sheet":
            result = await excel.excel_read_sheet(ExcelReadSheetSchema.parse(request.params.arguments));
            break;
          case "excel_write_to_sheet":
            result = await excel.excel_write_to_sheet(ExcelWriteToSheetSchema.parse(request.params.arguments));
            break;
          case "excel_copy_sheet":
            result = await excel.excel_copy_sheet(ExcelCopySheetSchema.parse(request.params.arguments));
            break;
          case "excel_create_table":
            result = await excel.excel_create_table(ExcelCreateTableSchema.parse(request.params.arguments));
            break;
          case "excel_format_range":
            result = await excel.excel_format_range(ExcelFormatRangeSchema.parse(request.params.arguments));
            break;
          case "excel_extract_images":
            result = await excel.excel_extract_images(ExcelExtractImagesSchema.parse(request.params.arguments));
            break;
          case "pdf_read_text":
            result = await pdf.pdf_read_text(PdfReadTextSchema.parse(request.params.arguments));
            break;
          case "pdf_get_metadata":
            result = await pdf.pdf_get_metadata(PdfGetMetadataSchema.parse(request.params.arguments));
            break;
          case "pdf_extract_pages":
            result = await pdf.pdf_extract_pages(PdfExtractPagesSchema.parse(request.params.arguments));
            break;
          case "pdf_merge":
            result = await pdf.pdf_merge(PdfMergeSchema.parse(request.params.arguments));
            break;
          case "pdf_split":
            result = await pdf.pdf_split(PdfSplitSchema.parse(request.params.arguments));
            break;
          case "pdf_rotate_pages":
            result = await pdf.pdf_rotate_pages(PdfRotatePagesSchema.parse(request.params.arguments));
            break;
          case "pdf_search_text":
            result = await pdf.pdf_search_text(PdfSearchTextSchema.parse(request.params.arguments));
            break;
          case "pdf_get_text_positions":
            result = await pdf.pdf_get_text_positions(PdfGetTextPositionsSchema.parse(request.params.arguments));
            break;
          case "pdf_create_dummy":
            result = await pdf.pdf_create_dummy(PdfCreateDummySchema.parse(request.params.arguments));
            break;
          case "docx_read_text":
            result = await docx.docx_read_text(DocxReadTextSchema.parse(request.params.arguments));
            break;
          case "docx_get_metadata":
            result = await docx.docx_get_metadata(DocxGetMetadataSchema.parse(request.params.arguments));
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
        }
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: any) {
        console.error(`Error calling ${request.params.name}:`, error);
        // Check if it's a Zod validation error
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: "text", text: `Invalid arguments for tool ${request.params.name}: ${JSON.stringify(error.format(), null, 2)}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: `Error in tool ${request.params.name}: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Office Document Engine MCP server running on stdio.");
  }
}

const serverInstance = new McpOfficeDocumentEngineServer();
serverInstance.run().catch((err) => {
  console.error("[Office Document Engine MCP] Fatal:", err);
  process.exit(1);
});