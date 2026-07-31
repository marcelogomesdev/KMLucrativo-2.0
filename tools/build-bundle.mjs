import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "..");
const modulos = [
    "js/date-utils.js",
    "js/utils.js",
    "js/financial-data.js",
    "js/storage.js",
    "js/settings.js",
    "js/backup.js",
    "js/dom.js",
    "js/state.js",
    "js/calculator.js",
    "js/simulator.js",
    "js/pdf.js",
    "js/theme.js",
    "js/navigation.js",
    "js/daily-records.js",
    "js/dashboard.js",
    "js/intelligence.js",
    "js/app.js"
];

const partes = [];
for (const arquivo of modulos) {
    const conteudo = await readFile(resolve(raiz, arquivo), "utf8");
    const transformado = conteudo
        .replace(/^import\s+[^;]+;\s*$/gm, "")
        .replace(/^export\s+/gm, "");
    partes.push(`\n/* ===== ${arquivo} ===== */\n${transformado.trim()}\n`);
}

const bundle = `/* Arquivo gerado por tools/build-bundle.mjs. Não editar manualmente. */\n(() => {\n"use strict";\n${partes.join("\n")}\n})();\n`;
await writeFile(resolve(raiz, "script.js"), bundle, "utf8");
