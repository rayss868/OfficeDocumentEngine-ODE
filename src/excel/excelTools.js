// excelTools.js
// Node.js utility untuk operasi dasar Excel
// Jalankan sebagai module (require) atau CLI sederhana.

// ================== IMPORTS ==================
const excelFunctions = require("./index");

// ================== SIMPLE CLI ===================
if (require.main === module) {
  const cmd = process.argv[2];
  const jsonArg = process.argv[3];

  if (!cmd || !jsonArg) {
    console.log(
      "Usage:\n" +
        "  node excelTools.js <command> '<jsonArgs>'\n\n" +
        "Commands:\n" +
        Object.keys(excelFunctions).join("\n  ") +
        "\n\n" +
        "Contoh:\n" +
        "  node excelTools.js excel_describe_sheets '{\"fileAbsolutePath\":\"./demo.xlsx\"}'\n"
    );
    process.exit(1);
  }

  let args;
  try {
    args = JSON.parse(jsonArg);
  } catch (e) {
    console.error("Argumen JSON tidak valid:", e.message);
    process.exit(1);
  }

  const fn = excelFunctions[cmd];

  if (!fn) {
    console.error("Unknown command:", cmd);
    process.exit(1);
  }

  // Handle async functions
  if (fn.constructor.name === 'AsyncFunction') {
    (async () => {
      try {
        const result = await fn(args);
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
      }
    })();
  } else {
    try {
      const result = fn(args);
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  }
}