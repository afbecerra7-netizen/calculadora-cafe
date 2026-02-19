import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .trim();
}

function minifyJsLight(js) {
  return js
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

const cssPath = path.join(root, "styles.css");
const jsPath = path.join(root, "script.js");

const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");

fs.writeFileSync(path.join(root, "styles.min.css"), minifyCss(css));
fs.writeFileSync(path.join(root, "script.min.js"), minifyJsLight(js));

console.log("Generated styles.min.css and script.min.js");
