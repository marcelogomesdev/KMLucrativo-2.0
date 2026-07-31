const CHAVE_CONFIGURACOES = "kmLucrativo.configuracoes.v2";

const CONFIGURACOES_PADRAO = {
    metaSemanal: 0,
    metaMensal: 0,
    metaAnual: 0,
    valorMinimoKm: 0
};

export function carregarConfiguracoes() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_CONFIGURACOES) || "{}");
        return Object.fromEntries(Object.entries({ ...CONFIGURACOES_PADRAO, ...dados }).map(([chave, valor]) => [chave, Number(valor) || 0]));
    } catch {
        return { ...CONFIGURACOES_PADRAO };
    }
}

export function salvarConfiguracoes(configuracoes) {
    const dados = { ...CONFIGURACOES_PADRAO, ...configuracoes };
    localStorage.setItem(CHAVE_CONFIGURACOES, JSON.stringify(dados));
    window.dispatchEvent(new CustomEvent("configuracoes-atualizadas", { detail: dados }));
}

function preencherFormularioConfiguracoes() {
    const configuracoes = carregarConfiguracoes();
    document.getElementById("configMetaSemanal").value = configuracoes.metaSemanal || "";
    document.getElementById("configMetaMensal").value = configuracoes.metaMensal || "";
    document.getElementById("configMetaAnual").value = configuracoes.metaAnual || "";
    document.getElementById("configValorMinimoKm").value = configuracoes.valorMinimoKm || "";
}

function salvarFormularioConfiguracoes(evento) {
    evento.preventDefault();
    salvarConfiguracoes({
        metaSemanal: Number(document.getElementById("configMetaSemanal").value) || 0,
        metaMensal: Number(document.getElementById("configMetaMensal").value) || 0,
        metaAnual: Number(document.getElementById("configMetaAnual").value) || 0,
        valorMinimoKm: Number(document.getElementById("configValorMinimoKm").value) || 0
    });
    document.getElementById("mensagemConfiguracoes").textContent = "Configurações salvas com sucesso.";
}

export function iniciarConfiguracoes() {
    preencherFormularioConfiguracoes();
    document.getElementById("formConfiguracoes").addEventListener("submit", salvarFormularioConfiguracoes);
}
