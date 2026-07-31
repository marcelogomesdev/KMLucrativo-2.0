import { carregarRegistros } from "./storage.js";
import { formatarNumero, moeda } from "./utils.js";
import { consolidar, despesasRegistro, normalizarRegistro, somar } from "./financial-data.js";
import { deslocarData, formatarData, hojeISO, inicioDaSemana } from "./date-utils.js";
import { carregarConfiguracoes } from "./settings.js";

const CORES = {
    azul: "#2563eb",
    azulClaro: "rgba(37, 99, 235, .18)",
    verde: "#16a34a",
    verdeClaro: "rgba(22, 163, 74, .18)",
    vermelho: "#dc2626",
    amarelo: "#ca8a04",
    roxo: "#7c3aed",
    ciano: "#0891b2",
    laranja: "#ea580c"
};

const graficos = new Map();
let periodoAtivo = "hoje";
let periodoPendente = "hoje";

function limitesPeriodo() {
    const hoje = hojeISO();
    if (periodoAtivo === "hoje") return [hoje, hoje];
    if (periodoAtivo === "ontem") {
        const ontem = deslocarData(hoje, -1);
        return [ontem, ontem];
    }
    if (periodoAtivo === "semana") return [inicioDaSemana(hoje), hoje];
    if (periodoAtivo === "mes") return [`${hoje.slice(0, 7)}-01`, hoje];
    if (periodoAtivo === "ano") return [`${hoje.slice(0, 4)}-01-01`, hoje];
    return [document.getElementById("filtroDataInicio").value, document.getElementById("filtroDataFim").value];
}

function atualizarProgressoMeta(id, lucro, meta) {
    const texto = document.getElementById(`progressoMeta${id}Texto`);
    const barra = document.getElementById(`progressoMeta${id}`);
    const falta = document.getElementById(`progressoMeta${id}Falta`);
    const percentual = meta > 0 ? Math.max(0, Math.min((lucro / meta) * 100, 100)) : 0;
    texto.textContent = meta > 0 ? `${moeda(lucro)} de ${moeda(meta)}` : "Meta não definida";
    barra.style.width = `${percentual}%`;
    barra.parentElement.setAttribute("aria-valuenow", String(Math.round(percentual)));
    falta.textContent = meta > 0
        ? (lucro >= meta ? `Meta atingida em ${moeda(lucro - meta)}` : `Faltam ${moeda(meta - lucro)}`)
        : "Defina a meta em Configurações";
}

function atualizarMetas() {
    const hoje = hojeISO();
    const registros = carregarRegistros().map(normalizarRegistro);
    const configuracoes = carregarConfiguracoes();
    const lucroEntre = (inicio) => consolidar(registros.filter((registro) => registro.data >= inicio && registro.data <= hoje)).lucro;
    atualizarProgressoMeta("Semanal", lucroEntre(inicioDaSemana(hoje)), configuracoes.metaSemanal);
    atualizarProgressoMeta("Mensal", lucroEntre(`${hoje.slice(0, 7)}-01`), configuracoes.metaMensal);
    atualizarProgressoMeta("Anual", lucroEntre(`${hoje.slice(0, 4)}-01-01`), configuracoes.metaAnual);
}

function registrosFiltrados() {
    const [inicio, fim] = limitesPeriodo();
    const aplicativo = document.getElementById("filtroAplicativo").value;
    return carregarRegistros()
        .map(normalizarRegistro)
        .filter((registro) => (!inicio || registro.data >= inicio) && (!fim || registro.data <= fim))
        .filter((registro) => aplicativo === "todos" || registro.aplicativo === aplicativo);
}

function atualizarMetricas(registros) {
    const { receita, despesas, lucro, km, horas, receitaHora, lucroHora, receitaKm, lucroKm, consumo, margem } = consolidar(registros);

    const valores = {
        dashReceita: moeda(receita),
        dashLucro: moeda(lucro),
        dashDespesas: moeda(despesas),
        dashKm: `${formatarNumero(km)} km`,
        dashHoras: `${formatarNumero(horas)} h`,
        dashReceitaHora: moeda(receitaHora),
        dashLucroHora: moeda(lucroHora),
        dashReceitaKm: moeda(receitaKm),
        dashLucroKm: moeda(lucroKm),
        dashConsumo: `${formatarNumero(consumo, 2)} km/L`,
        dashMargem: `${formatarNumero(margem, 1)}%`
    };
    Object.entries(valores).forEach(([id, valor]) => { document.getElementById(id).textContent = valor; });
    document.getElementById("dashboardSemDados").classList.toggle("visivel", registros.length === 0);
}

function agruparPorDia(registros) {
    const mapa = new Map();
    registros.forEach((registro) => {
        const atual = mapa.get(registro.data) || { receita: 0, lucro: 0, km: 0, horas: 0, litros: 0 };
        atual.receita += registro.receitaBruta;
        atual.lucro += registro.receitaBruta - despesasRegistro(registro);
        atual.km += registro.kmRodados;
        atual.horas += registro.horasTrabalhadas;
        atual.litros += registro.litrosAbastecidos;
        mapa.set(registro.data, atual);
    });
    return [...mapa.entries()].sort(([dataA], [dataB]) => dataA.localeCompare(dataB));
}

function rotuloData(data) {
    return formatarData(data, { day: "2-digit", month: "2-digit" });
}

function opcoesBase(eixoMonetario = false) {
    const corTexto = document.body.classList.contains("dark") ? "#d1d5db" : "#666";
    const corGrade = document.body.classList.contains("dark") ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
            legend: { labels: { color: corTexto, usePointStyle: true } },
            tooltip: { callbacks: eixoMonetario ? { label: (contexto) => `${contexto.dataset.label || "Valor"}: ${moeda(contexto.parsed.y ?? contexto.parsed)}` } : {} }
        },
        scales: {
            x: { ticks: { color: corTexto }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: corTexto }, grid: { color: corGrade } }
        }
    };
}

function criarGrafico(id, configuracao) {
    if (!window.Chart) return;
    graficos.get(id)?.destroy();
    const contexto = document.getElementById(id).getContext("2d");
    graficos.set(id, new window.Chart(contexto, configuracao));
}

function atualizarGraficos(registros) {
    const dias = agruparPorDia(registros);
    const labelsDias = dias.map(([data]) => rotuloData(data));
    const linha = (label, dados, cor, fundo) => ({ label, data: dados, borderColor: cor, backgroundColor: fundo, fill: true, tension: .35, pointRadius: 3, pointHoverRadius: 6 });

    criarGrafico("graficoReceitaDia", { type: "line", data: { labels: labelsDias, datasets: [linha("Receita", dias.map(([, valor]) => valor.receita), CORES.azul, CORES.azulClaro)] }, options: opcoesBase(true) });
    criarGrafico("graficoLucroDia", { type: "line", data: { labels: labelsDias, datasets: [linha("Lucro", dias.map(([, valor]) => valor.lucro), CORES.verde, CORES.verdeClaro)] }, options: opcoesBase(true) });

    const apps = ["Uber", "99", "InDrive"];
    criarGrafico("graficoReceitaApp", {
        type: "doughnut",
        data: { labels: apps, datasets: [{ data: apps.map((app) => registros.filter((registro) => registro.aplicativo === app).reduce((total, registro) => total + registro.receitaBruta, 0)), backgroundColor: [CORES.azul, CORES.amarelo, CORES.roxo], borderWidth: 0 }] },
        options: { ...opcoesBase(), cutout: "64%", scales: undefined }
    });

    const despesas = [
        ["Combustível", somar(registros, "valorCombustivel")],
        ["Alimentação", somar(registros, "alimentacao")],
        ["Pedágio", somar(registros, "pedagio")],
        ["Estacionamento", somar(registros, "estacionamento")],
        ["Outras", somar(registros, "outrasDespesas")]
    ];
    criarGrafico("graficoDespesas", { type: "doughnut", data: { labels: despesas.map(([nome]) => nome), datasets: [{ data: despesas.map(([, valor]) => valor), backgroundColor: [CORES.laranja, CORES.amarelo, CORES.vermelho, CORES.ciano, CORES.roxo], borderWidth: 0 }] }, options: { ...opcoesBase(), cutout: "58%", scales: undefined } });
    criarGrafico("graficoKm", { type: "bar", data: { labels: labelsDias, datasets: [{ label: "KM", data: dias.map(([, valor]) => valor.km), backgroundColor: CORES.azul, borderRadius: 7 }] }, options: opcoesBase() });
    criarGrafico("graficoHoras", { type: "bar", data: { labels: labelsDias, datasets: [{ label: "Horas", data: dias.map(([, valor]) => valor.horas), backgroundColor: CORES.roxo, borderRadius: 7 }] }, options: opcoesBase() });
    criarGrafico("graficoConsumo", { type: "line", data: { labels: labelsDias, datasets: [linha("km/L", dias.map(([, valor]) => valor.litros > 0 ? valor.km / valor.litros : 0), CORES.ciano, "rgba(8,145,178,.18)")] }, options: opcoesBase() });
}

function atualizarDescricaoPeriodo() {
    const [inicio, fim] = limitesPeriodo();
    document.getElementById("dashboardPeriodo").textContent = inicio === fim ? formatarData(inicio) : `${formatarData(inicio)} a ${formatarData(fim)}`;
}

export function atualizarDashboard() {
    const registros = registrosFiltrados();
    atualizarDescricaoPeriodo();
    atualizarMetricas(registros);
    atualizarGraficos(registros);
    atualizarMetas();
}

export function iniciarDashboard() {
    const hoje = hojeISO();
    document.getElementById("filtroDataInicio").value = hoje;
    document.getElementById("filtroDataFim").value = hoje;

    const painel = document.getElementById("painelFiltros");
    const overlay = document.getElementById("filtrosOverlay");
    const abrirFiltros = () => {
        painel.classList.add("aberto");
        overlay.hidden = false;
        document.body.classList.add("drawer-aberto");
        document.getElementById("btnAbrirFiltros").setAttribute("aria-expanded", "true");
        document.getElementById("btnFecharFiltros").focus();
    };
    const fecharFiltros = () => {
        painel.classList.remove("aberto");
        overlay.hidden = true;
        document.body.classList.remove("drawer-aberto");
        document.getElementById("btnAbrirFiltros").setAttribute("aria-expanded", "false");
        document.getElementById("btnAbrirFiltros").focus();
    };

    document.querySelectorAll(".filtro-periodo").forEach((botao) => {
        botao.addEventListener("click", () => {
            periodoPendente = botao.dataset.periodo;
            document.querySelectorAll(".filtro-periodo").forEach((item) => item.classList.toggle("ativo", item === botao));
            document.getElementById("camposPeriodoPersonalizado").hidden = periodoPendente !== "personalizado";
        });
    });

    document.getElementById("btnAbrirFiltros").addEventListener("click", abrirFiltros);
    document.getElementById("btnFecharFiltros").addEventListener("click", fecharFiltros);
    overlay.addEventListener("click", fecharFiltros);
    document.getElementById("btnAplicarFiltros").addEventListener("click", () => {
        periodoAtivo = periodoPendente;
        atualizarDashboard();
        fecharFiltros();
    });
    document.getElementById("btnLimparFiltros").addEventListener("click", () => {
        periodoAtivo = "hoje";
        periodoPendente = "hoje";
        document.getElementById("filtroDataInicio").value = hoje;
        document.getElementById("filtroDataFim").value = hoje;
        document.getElementById("filtroAplicativo").value = "todos";
        document.getElementById("camposPeriodoPersonalizado").hidden = true;
        document.querySelectorAll(".filtro-periodo").forEach((item) => item.classList.toggle("ativo", item.dataset.periodo === "hoje"));
        atualizarDashboard();
        fecharFiltros();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && painel.classList.contains("aberto")) fecharFiltros();
    });
    window.addEventListener("registros-atualizados", atualizarDashboard);
    window.addEventListener("tema-atualizado", atualizarDashboard);
    window.addEventListener("configuracoes-atualizadas", atualizarDashboard);
    window.addEventListener("aba-alterada", (evento) => {
        if (evento.detail.aba === "abaDashboard") atualizarDashboard();
    });
    atualizarDashboard();
}
