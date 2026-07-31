import { carregarRegistros, salvarRegistros } from "./storage.js";
import { carregarConfiguracoes, salvarConfiguracoes } from "./settings.js";
import { hojeISO } from "./date-utils.js";

function baixarArquivo(nome, conteudo) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function exportarBackup() {
    const backup = {
        produto: "KM Lucrativo",
        versao: "2.1.0",
        geradoEm: new Date().toISOString(),
        registros: carregarRegistros(),
        configuracoes: carregarConfiguracoes(),
        tema: localStorage.getItem("kmLucrativo.tema.v2") || "light"
    };
    baixarArquivo(`km-lucrativo-backup-${hojeISO()}.json`, JSON.stringify(backup, null, 2));
}

async function importarArquivo(arquivo) {
    if (!arquivo) return;
    try {
        const backup = JSON.parse(await arquivo.text());
        if (backup.produto !== "KM Lucrativo" || !Array.isArray(backup.registros) || typeof backup.configuracoes !== "object" || !backup.configuracoes) {
            throw new Error("Backup inválido");
        }
        salvarRegistros(backup.registros);
        salvarConfiguracoes(backup.configuracoes);
        if (["light", "dark"].includes(backup.tema)) localStorage.setItem("kmLucrativo.tema.v2", backup.tema);
        alert("Backup importado com sucesso.");
        window.location.reload();
    } catch {
        alert("O arquivo selecionado não é um backup válido do KM Lucrativo.");
    }
}

export function iniciarBackup() {
    const seletor = document.getElementById("arquivoBackup");
    document.getElementById("btnSalvarBackup").addEventListener("click", exportarBackup);
    document.getElementById("btnImportarBackup").addEventListener("click", () => seletor.click());
    seletor.addEventListener("change", async () => {
        await importarArquivo(seletor.files[0]);
        seletor.value = "";
    });
}
