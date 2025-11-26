// pdfTools.ts
// Node.js utility for basic PDF operations
// Can be run as a module (require) or a simple CLI.

// ================== IMPORTS ==================
import * as pdfFunctions from "./index";

// ================== SIMPLE CLI ===================
if (require.main === module) {
  const cmd = process.argv[2];
  const jsonArg = process.argv[3];

  if (!cmd || !jsonArg) {
    console.log(
      "Usage:\n" +
        "  node pdfTools.ts <command> '<jsonArgs>'\n\n" +
        "Commands:\n" +
        Object.keys(pdfFunctions).join("\n  ") +
        "\n\n" +
        "Example:\n" +
        "  node pdfTools.ts pdf_get_page_count '{\"fileAbsolutePath\":\"./demo.pdf\"}'\n" +
        "  node pdfTools.ts pdf_merge '{\"fileAbsolutePaths\":[\"./input1.pdf\", \"./input2.pdf\"], \"outputFilePath\":\"./merged.pdf\"}'\n" +
        "  node pdfTools.ts pdf_split '{\"fileAbsolutePath\":\"./demo.pdf\", \"pageNumber\":2, \"outputFilePathPart1\":\"./part1.pdf\", \"outputFilePathPart2\":\"./part2.pdf\"}'\n" +
        "  node pdfTools.ts pdf_rotate_pages '{\"fileAbsolutePath\":\"./demo.pdf\", \"outputFilePath\":\"./rotated.pdf\", \"pages\":[1], \"rotationAngle\":90}'\n"
    );
    process.exit(1);
  }

  let args;
  try {
    args = JSON.parse(jsonArg);
  } catch (e) {
    console.error("Invalid JSON argument:", e.message);
    process.exit(1);
  }

  const fn = (pdfFunctions as any)[cmd];

  if (!fn) {
    console.error("Unknown command:", cmd);
    process.exit(1);
  }

  // All PDF functions are async, so always handle as such
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