import { consolidar, normalizarRegistro } from "./financial-data.js";
import { carregarRegistros } from "./storage.js";
import { formatarNumero, moeda } from "./utils.js";
import { deslocarData, formatarData } from "./date-utils.js";
import { carregarConfiguracoes } from "./settings.js";

function agrupar(registros, propriedade) {
    const grupos = new Map();
    registros.forEach((registro) => {
        const chave = registro[propriedade];
        const lista = grupos.get(chave) || [];
        lista.push(registro);
        grupos.set(chave, lista);
    });
    return [...grupos.entries()].map(([nome, itens]) => ({ nome, itens, ...consolidar(itens) }));
}

function definir(id, valor) {
    document.getElementById(id).textContent = valor;
}

function atualizarExtremos(dias, apps) {
    const porLucro = [...dias].sort((a, b) => b.lucro - a.lucro);
    const porProdutividade = [...dias].sort((a, b) => b.lucroHora - a.lucroHora);
    const porApp = [...apps].sort((a, b) => b.lucro - a.lucro);
    const melhorDia = porLucro[0];
    const piorDia = porLucro.at(-1);
    const melhorApp = porApp[0];
    const piorApp = porApp.at(-1);
    const maisProdutivo = porProdutividade[0];
    const menosProdutivo = porProdutividade.at(-1);

    definir("analiseMelhorDia", melhorDia ? formatarData(melhorDia.nome) : "—");
    definir("analiseMelhorDiaDetalhe", melhorDia ? `${moeda(melhorDia.lucro)} de lucro` : "Sem dados");
    definir("analisePiorDia", piorDia ? formatarData(piorDia.nome) : "—");
    definir("analisePiorDiaDetalhe", piorDia ? `${moeda(piorDia.lucro)} de lucro` : "Sem dados");
    definir("analiseMelhorApp", melhorApp?.nome || "—");
    definir("analiseMelhorAppDetalhe", melhorApp ? `${moeda(melhorApp.lucro)} de lucro` : "Sem dados");
    definir("analisePiorApp", piorApp?.nome || "—");
    definir("analisePiorAppDetalhe", piorApp ? `${moeda(piorApp.lucro)} de lucro` : "Sem dados");
    definir("analiseMaisProdutivo", maisProdutivo ? formatarData(maisProdutivo.nome) : "—");
    definir("analiseMaisProdutivoDetalhe", maisProdutivo ? `${moeda(maisProdutivo.lucroHora)} de lucro/h` : "Sem dados");
    definir("analiseMenosProdutivo", menosProdutivo ? formatarData(menosProdutivo.nome) : "—");
    definir("analiseMenosProdutivoDetalhe", menosProdutivo ? `${moeda(menosProdutivo.lucroHora)} de lucro/h` : "Sem dados");
}

function atualizarMedias(registros, quantidadeDias) {
    const totais = consolidar(registros);
    definir("analiseLucroMedio", moeda(quantidadeDias ? totais.lucro / quantidadeDias : 0));
    definir("analiseReceitaMedia", moeda(quantidadeDias ? totais.receita / quantidadeDias : 0));
    definir("analiseHorasMedia", `${formatarNumero(quantidadeDias ? totais.horas / quantidadeDias : 0)} h`);
    definir("analiseConsumoMedio", `${formatarNumero(totais.consumo, 2)} km/L`);
}

function periodosComparativos(registros) {
    if (!registros.length) return { atual: [], anterior: [], inicioAtual: "", fimAtual: "" };
    const fimAtual = [...registros].sort((a, b) => b.data.localeCompare(a.data))[0].data;
    const inicioAtual = deslocarData(fimAtual, -29);
    const fimAnterior = deslocarData(inicioAtual, -1);
    const inicioAnterior = deslocarData(fimAnterior, -29);
    return {
        atual: registros.filter((registro) => registro.data >= inicioAtual && registro.data <= fimAtual),
        anterior: registros.filter((registro) => registro.data >= inicioAnterior && registro.data <= fimAnterior),
        inicioAtual,
        fimAtual
    };
}

function percentual(atual, anterior) {
    if (anterior === 0) return null;
    return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function atualizarComparacaoPeriodos(comparacao) {
    const elemento = document.getElementById("comparacaoPeriodos");
    if (!comparacao.atual.length || !comparacao.anterior.length) {
        elemento.textContent = "São necessários registros nos últimos 30 dias e nos 30 dias anteriores para uma comparação completa.";
        return;
    }
    const atual = consolidar(comparacao.atual);
    const anterior = consolidar(comparacao.anterior);
    const variacaoLucro = percentual(atual.lucro, anterior.lucro);
    const variacaoReceita = percentual(atual.receita, anterior.receita);
    if (variacaoLucro === null || variacaoReceita === null) {
        elemento.textContent = "A comparação ainda não possui uma base financeira suficiente no período anterior.";
        return;
    }
    elemento.textContent = `Nos 30 dias mais recentes, a receita ${variacaoReceita >= 0 ? "cresceu" : "caiu"} ${formatarNumero(Math.abs(variacaoReceita), 1)}% e o lucro ${variacaoLucro >= 0 ? "cresceu" : "caiu"} ${formatarNumero(Math.abs(variacaoLucro), 1)}% em relação aos 30 dias anteriores.`;
}

function atualizarComparacaoApps(apps) {
    const container = document.getElementById("comparacaoAplicativos");
    container.replaceChildren();
    if (!apps.length) {
        const texto = document.createElement("p");
        texto.textContent = "Cadastre registros para comparar os aplicativos.";
        container.appendChild(texto);
        return;
    }
    const maior = Math.max(...apps.map((app) => Math.abs(app.lucro)), 1);
    [...apps].sort((a, b) => b.lucro - a.lucro).forEach((app) => {
        const linha = document.createElement("div");
        linha.className = "comparacao-app";
        const nome = document.createElement("strong");
        nome.textContent = app.nome;
        const barra = document.createElement("div");
        barra.className = "comparacao-barra";
        const preenchimento = document.createElement("span");
        preenchimento.style.width = `${Math.max((Math.abs(app.lucro) / maior) * 100, 3)}%`;
        if (app.lucro < 0) preenchimento.style.background = "var(--vermelho)";
        barra.appendChild(preenchimento);
        const valor = document.createElement("span");
        valor.textContent = moeda(app.lucro);
        linha.append(nome, barra, valor);
        container.appendChild(linha);
    });
}

function adicionarRecomendacao(container, texto, tipo = "neutra", icone = "fa-circle-info") {
    const item = document.createElement("article");
    item.className = `recomendacao ${tipo}`;
    const simbolo = document.createElement("i");
    simbolo.className = `fa-solid ${icone}`;
    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;
    item.append(simbolo, paragrafo);
    container.appendChild(item);
}

function tendencia(container, nome, atual, anterior, melhorQuandoSobe, unidade) {
    const variacao = percentual(atual, anterior);
    if (variacao === null || Math.abs(variacao) < 3) return;
    const subiu = variacao > 0;
    const positiva = subiu === melhorQuandoSobe;
    adicionarRecomendacao(
        container,
        `${nome} ${subiu ? "aumentou" : "caiu"} ${formatarNumero(Math.abs(variacao), 1)}% (${unidade(atual)}) nos últimos 30 dias.`,
        positiva ? "positiva" : "negativa",
        positiva ? "fa-arrow-trend-up" : "fa-triangle-exclamation"
    );
}

function atualizarRecomendacoes(registros, comparacao) {
    const container = document.getElementById("recomendacoesLista");
    container.replaceChildren();
    if (!registros.length) {
        adicionarRecomendacao(container, "Cadastre seus resultados diários para receber recomendações financeiras personalizadas.");
        return;
    }

    if (comparacao.atual.length && comparacao.anterior.length) {
        const atual = consolidar(comparacao.atual);
        const anterior = consolidar(comparacao.anterior);
        tendencia(container, "Seu consumo", atual.consumo, anterior.consumo, true, (valor) => `${formatarNumero(valor, 2)} km/L`);
        tendencia(container, "Seu lucro", atual.lucro, anterior.lucro, true, moeda);
        tendencia(container, "Seu ganho por hora", atual.lucroHora, anterior.lucroHora, true, moeda);
        tendencia(container, "Seu custo por km", atual.custoKm, anterior.custoKm, false, moeda);
    }

    const configuracoes = carregarConfiguracoes();
    const lucroMeta = configuracoes.metaMensal || Number(document.getElementById("lucro").value) || 0;
    const atual = consolidar(comparacao.atual);
    if (lucroMeta > 0) {
        const acima = atual.lucro >= lucroMeta;
        adicionarRecomendacao(container, `Você está ${acima ? "acima" : "abaixo"} da meta mensal de lucro em ${moeda(Math.abs(atual.lucro - lucroMeta))}.`, acima ? "positiva" : "alerta", acima ? "fa-circle-check" : "fa-bullseye");
    } else {
        adicionarRecomendacao(container, "Defina uma meta mensal em Configurações para acompanhar seu desempenho.", "alerta", "fa-bullseye");
    }

    const totais = consolidar(registros);
    if (configuracoes.valorMinimoKm > 0) {
        const acima = totais.lucroKm >= configuracoes.valorMinimoKm;
        adicionarRecomendacao(container, `Seu lucro por km está ${acima ? "acima" : "abaixo"} do mínimo definido em ${moeda(Math.abs(totais.lucroKm - configuracoes.valorMinimoKm))}.`, acima ? "positiva" : "alerta", acima ? "fa-circle-check" : "fa-road");
    }
    if (totais.margem < 30) adicionarRecomendacao(container, `Sua margem de lucro está em ${formatarNumero(totais.margem, 1)}%. Revise despesas e corridas com baixo retorno.`, "alerta", "fa-percent");
    if (!container.children.length) adicionarRecomendacao(container, "Seu desempenho está estável. Continue registrando os resultados para identificar novas tendências.", "positiva", "fa-circle-check");
}

export function atualizarAnaliseInteligente() {
    const registros = carregarRegistros().map(normalizarRegistro).filter((registro) => registro.data);
    const dias = agrupar(registros, "data");
    const apps = agrupar(registros, "aplicativo");
    const comparacao = periodosComparativos(registros);
    definir("analiseQuantidade", `${registros.length} ${registros.length === 1 ? "registro" : "registros"}`);
    atualizarExtremos(dias, apps);
    atualizarMedias(registros, dias.length);
    atualizarComparacaoPeriodos(comparacao);
    atualizarComparacaoApps(apps);
    atualizarRecomendacoes(registros, comparacao);
}

export function iniciarAnaliseInteligente() {
    window.addEventListener("registros-atualizados", atualizarAnaliseInteligente);
    window.addEventListener("financeiro-calculado", atualizarAnaliseInteligente);
    window.addEventListener("configuracoes-atualizadas", atualizarAnaliseInteligente);
    atualizarAnaliseInteligente();
}
