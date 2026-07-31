import { elementos } from "./dom.js";

const CHAVE_TEMA = "kmLucrativo.tema.v2";

function aplicarTema(escuro) {
    document.body.classList.toggle("dark", escuro);
    document.querySelectorAll("img[data-src-light][data-src-dark]").forEach((logo) => {
        logo.src = escuro ? logo.dataset.srcDark : logo.dataset.srcLight;
    });
    const corTema = document.getElementById("themeColor");
    if (corTema) corTema.content = escuro ? "#0f172a" : "#f4f7fb";
    const icone = elementos.btnModoEscuro.querySelector("i");
    icone.className = escuro ? "fa-solid fa-sun" : "fa-solid fa-moon";
    elementos.btnModoEscuro.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
    elementos.btnModoEscuro.title = escuro ? "Ativar modo claro" : "Ativar modo escuro";
    const botaoConfiguracoes = document.getElementById("btnTemaConfiguracoes");
    if (botaoConfiguracoes) {
        botaoConfiguracoes.querySelector("i").className = escuro ? "fa-solid fa-sun" : "fa-solid fa-moon";
        botaoConfiguracoes.querySelector("span").textContent = escuro ? "Ativar modo claro" : "Ativar modo escuro";
    }
    window.dispatchEvent(new CustomEvent("tema-atualizado"));
}

/** Alterna o tema visual e mantém a preferência no navegador. */
export function alternarModoEscuro() {
    const escuro = !document.body.classList.contains("dark");
    aplicarTema(escuro);
    try {
        localStorage.setItem(CHAVE_TEMA, escuro ? "dark" : "light");
    } catch {
        // O tema continua funcional mesmo quando o armazenamento está indisponível.
    }
}

/** Restaura o tema salvo ou respeita a preferência do sistema operacional. */
export function iniciarTema() {
    let preferencia = null;
    try {
        preferencia = localStorage.getItem(CHAVE_TEMA);
    } catch {
        preferencia = null;
    }
    const escuro = preferencia ? preferencia === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    aplicarTema(escuro);
}
