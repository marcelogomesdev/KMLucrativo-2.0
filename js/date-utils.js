/** Retorna a data local atual no formato ISO (AAAA-MM-DD). */
export function hojeISO() {
    const data = new Date();
    const deslocamento = data.getTimezoneOffset() * 60000;
    return new Date(data.getTime() - deslocamento).toISOString().slice(0, 10);
}

/** Formata uma data ISO sem deslocamento indevido de fuso horário. */
export function formatarData(data, opcoes) {
    if (!data) return "—";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", opcoes);
}

/** Retorna uma data ISO deslocada pela quantidade informada de dias. */
export function deslocarData(data, dias) {
    const resultado = new Date(`${data}T12:00:00`);
    resultado.setDate(resultado.getDate() + dias);
    return resultado.toISOString().slice(0, 10);
}

/** Retorna a segunda-feira da semana que contém a data informada. */
export function inicioDaSemana(data) {
    const diaDaSemana = new Date(`${data}T12:00:00`).getDay() || 7;
    return deslocarData(data, -diaDaSemana + 1);
}
