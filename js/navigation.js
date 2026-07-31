/** Controla a navegação acessível entre os painéis principais da aplicação. */
export function iniciarNavegacao() {
    const botoes = [...document.querySelectorAll(".aba-botao")];
    const abas = [...document.querySelectorAll(".aba-conteudo")];

    function ativarAba(botao, moverFoco = false) {
        const abaAlvo = botao.dataset.aba;

        botoes.forEach((item) => {
            const ativa = item === botao;
            item.classList.toggle("ativo", ativa);
            item.setAttribute("aria-selected", String(ativa));
            item.tabIndex = ativa ? 0 : -1;
        });

        abas.forEach((aba) => {
            const ativa = aba.id === abaAlvo;
            aba.classList.toggle("ativo", ativa);
            aba.hidden = !ativa;
        });

        if (moverFoco) botao.focus();
        window.dispatchEvent(new CustomEvent("aba-alterada", { detail: { aba: abaAlvo } }));
    }

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => ativarAba(botao));
        botao.addEventListener("keydown", (evento) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(evento.key)) return;
            evento.preventDefault();
            const indiceAtual = botoes.indexOf(botao);
            const indice = evento.key === "Home"
                ? 0
                : evento.key === "End"
                    ? botoes.length - 1
                    : (indiceAtual + (evento.key === "ArrowRight" ? 1 : -1) + botoes.length) % botoes.length;
            ativarAba(botoes[indice], true);
        });
    });
}
