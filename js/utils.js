export function numero(id) {
    const campo = document.getElementById(id);
    return campo ? Number(campo.value) || 0 : 0;
}

export function moeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function atualizarCard(card, valor) {
    card.textContent = moeda(valor);
}

export function formatarNumero(valor, casas = 1) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}
