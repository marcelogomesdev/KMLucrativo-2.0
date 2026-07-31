const CHAVE_REGISTROS = "kmLucrativo.registrosDiarios.v2";

export function carregarRegistros() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_REGISTROS) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

export function salvarRegistros(registros) {
    localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
    window.dispatchEvent(new CustomEvent("registros-atualizados"));
}
