// docx/docxTools.ts
// Node.js utility for basic DOCX operations
// Can be used as a module (require) or a simple CLI.

// ================== IMPORTS ==================
import * as path from 'path';
import {
  docx_read_text,
  docx_get_metadata,
} from './index'; // Import all DOCX functions from index.js

// ================== SIMPLE CLI ===================
if (require.main === module) {
  const cmd = process.argv[2];
  const jsonArg = process.argv[3];

  if (!cmd || !jsonArg) {
    console.log(
      "Usage:\n" +
      "  ts-node docxTools.ts <command> '<jsonArgs>'\n\n" +
      "Commands:\n" +
      "  docx_read_text\n" +
      "  docx_get_metadata\n\n" +
      "Example:\n" +
      "  ts-node docxTools.ts docx_read_text '{\"fileAbsolutePath\":\"./document.docx\"}'\n"
    );
    process.exit(1);
  }

  let args;
  try {
    args = JSON.parse(jsonArg);
  } catch (e: any) {
    console.error("Invalid JSON argument:", e.message);
    process.exit(1);
  }

  const fns: { [key: string]: Function } = {
    docx_read_text,
    docx_get_metadata,
  };
  const fn = fns[cmd];

  if (!fn) {
    console.error("Unknown command:", cmd);
    process.exit(1);
  }

  (async () => {
    try {
      const result = await fn(args);
      console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  })();
}