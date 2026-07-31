export function numeroSeguro(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

export function normalizarRegistro(registro) {
    return {
        ...registro,
        horasTrabalhadas: numeroSeguro(registro.horasTrabalhadas),
        kmRodados: numeroSeguro(registro.kmRodados),
        receitaBruta: numeroSeguro(registro.receitaBruta),
        litrosAbastecidos: numeroSeguro(registro.litrosAbastecidos),
        valorCombustivel: numeroSeguro(registro.valorCombustivel),
        alimentacao: numeroSeguro(registro.alimentacao),
        pedagio: numeroSeguro(registro.pedagio),
        estacionamento: numeroSeguro(registro.estacionamento),
        outrasDespesas: numeroSeguro(registro.outrasDespesas)
    };
}

export function despesasRegistro(registro) {
    return registro.valorCombustivel
        + registro.alimentacao
        + registro.pedagio
        + registro.estacionamento
        + registro.outrasDespesas;
}

export function somar(registros, propriedade) {
    return registros.reduce((total, registro) => total + registro[propriedade], 0);
}

export function consolidar(registros) {
    const receita = somar(registros, "receitaBruta");
    const despesas = registros.reduce((total, registro) => total + despesasRegistro(registro), 0);
    const km = somar(registros, "kmRodados");
    const horas = somar(registros, "horasTrabalhadas");
    const litros = somar(registros, "litrosAbastecidos");
    return {
        receita,
        despesas,
        lucro: receita - despesas,
        km,
        horas,
        litros,
        receitaHora: horas > 0 ? receita / horas : 0,
        lucroHora: horas > 0 ? (receita - despesas) / horas : 0,
        receitaKm: km > 0 ? receita / km : 0,
        lucroKm: km > 0 ? (receita - despesas) / km : 0,
        custoKm: km > 0 ? despesas / km : 0,
        consumo: litros > 0 ? km / litros : 0,
        margem: receita > 0 ? ((receita - despesas) / receita) * 100 : 0
    };
}
