const fs = require("fs");
const path = require("path");

const appsRoot = path.resolve(__dirname, "..", "apps");
const appNames = fs
  .readdirSync(appsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const violations = [];

function visit(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(entryPath, files);
    } else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

for (const appName of appNames) {
  const appRoot = path.join(appsRoot, appName);
  for (const file of visit(appRoot)) {
    const source = fs.readFileSync(file, "utf8");
    const importPattern =
      /(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\()\s*["']([^"']+)["']/g;

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      let importedApp;

      if (specifier.startsWith(".")) {
        const resolvedPath = path.resolve(path.dirname(file), specifier);
        const relativePath = path.relative(appsRoot, resolvedPath);
        if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
          importedApp = relativePath.split(path.sep)[0];
        }
      } else {
        const appPathMatch = specifier.match(/(?:^|\/)apps\/([^/]+)\//);
        importedApp = appPathMatch?.[1];
      }

      if (importedApp && importedApp !== appName && appNames.includes(importedApp)) {
        violations.push(
          `${path.relative(process.cwd(), file)} imports app "${importedApp}"`,
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Cross-service imports are not allowed:");
  console.error(violations.map((violation) => `- ${violation}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Architecture boundary check passed.");
}
