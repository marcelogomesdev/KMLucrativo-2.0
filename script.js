/* Arquivo gerado por tools/build-bundle.mjs. Não editar manualmente. */
(() => {
"use strict";

/* ===== js/date-utils.js ===== */
/** Retorna a data local atual no formato ISO (AAAA-MM-DD). */
function hojeISO() {
    const data = new Date();
    const deslocamento = data.getTimezoneOffset() * 60000;
    return new Date(data.getTime() - deslocamento).toISOString().slice(0, 10);
}

/** Formata uma data ISO sem deslocamento indevido de fuso horário. */
function formatarData(data, opcoes) {
    if (!data) return "—";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", opcoes);
}

/** Retorna uma data ISO deslocada pela quantidade informada de dias. */
function deslocarData(data, dias) {
    const resultado = new Date(`${data}T12:00:00`);
    resultado.setDate(resultado.getDate() + dias);
    return resultado.toISOString().slice(0, 10);
}

/** Retorna a segunda-feira da semana que contém a data informada. */
function inicioDaSemana(data) {
    const diaDaSemana = new Date(`${data}T12:00:00`).getDay() || 7;
    return deslocarData(data, -diaDaSemana + 1);
}


/* ===== js/utils.js ===== */
function numero(id) {
    const campo = document.getElementById(id);
    return campo ? Number(campo.value) || 0 : 0;
}

function moeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarCard(card, valor) {
    card.textContent = moeda(valor);
}

function formatarNumero(valor, casas = 1) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}


/* ===== js/financial-data.js ===== */
function numeroSeguro(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function normalizarRegistro(registro) {
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

function despesasRegistro(registro) {
    return registro.valorCombustivel
        + registro.alimentacao
        + registro.pedagio
        + registro.estacionamento
        + registro.outrasDespesas;
}

function somar(registros, propriedade) {
    return registros.reduce((total, registro) => total + registro[propriedade], 0);
}

function consolidar(registros) {
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


/* ===== js/storage.js ===== */
const CHAVE_REGISTROS = "kmLucrativo.registrosDiarios.v2";

function carregarRegistros() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_REGISTROS) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarRegistros(registros) {
    localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
    window.dispatchEvent(new CustomEvent("registros-atualizados"));
}


/* ===== js/settings.js ===== */
const CHAVE_CONFIGURACOES = "kmLucrativo.configuracoes.v2";

const CONFIGURACOES_PADRAO = {
    metaSemanal: 0,
    metaMensal: 0,
    metaAnual: 0,
    valorMinimoKm: 0
};

function carregarConfiguracoes() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_CONFIGURACOES) || "{}");
        return Object.fromEntries(Object.entries({ ...CONFIGURACOES_PADRAO, ...dados }).map(([chave, valor]) => [chave, Number(valor) || 0]));
    } catch {
        return { ...CONFIGURACOES_PADRAO };
    }
}

function salvarConfiguracoes(configuracoes) {
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

function iniciarConfiguracoes() {
    preencherFormularioConfiguracoes();
    document.getElementById("formConfiguracoes").addEventListener("submit", salvarFormularioConfiguracoes);
}


/* ===== js/backup.js ===== */
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

function exportarBackup() {
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

function iniciarBackup() {
    const seletor = document.getElementById("arquivoBackup");
    document.getElementById("btnSalvarBackup").addEventListener("click", exportarBackup);
    document.getElementById("btnImportarBackup").addEventListener("click", () => seletor.click());
    seletor.addEventListener("change", async () => {
        await importarArquivo(seletor.files[0]);
        seletor.value = "";
    });
}


/* ===== js/dom.js ===== */
const elementos = {
    btnCalcular: document.getElementById("btnCalcular"),
    btnSimular: document.getElementById("btnSimular"),
    btnModoEscuro: document.getElementById("modoEscuro"),
    btnPDF: document.getElementById("btnPDF"),
    painel: document.getElementById("painelFinanceiro"),
    diagnostico: document.getElementById("diagnostico"),
    resultadoCorrida: document.getElementById("resultadoCorrida"),
    mensagemDiagnostico: document.getElementById("mensagemDiagnostico"),
    statusCorrida: document.getElementById("statusCorrida"),
    cards: {
        custoMensal: document.getElementById("custoMensal"),
        custoReal: document.getElementById("custoReal"),
        combustivelKm: document.getElementById("combustivelKm"),
        metaDiaria: document.getElementById("metaDiaria"),
        metaSemanal: document.getElementById("metaSemanal"),
        metaMensal: document.getElementById("metaMensal"),
        valorKm: document.getElementById("valorKm"),
        custoCorrida: document.getElementById("custoCorrida"),
        lucroCorrida: document.getElementById("lucroCorrida"),
        lucroKm: document.getElementById("lucroKm")
    }
};


/* ===== js/state.js ===== */
const estadoFinanceiro = {
    custoMensal: 0,
    combustivelKm: 0,
    custoRealKm: 0,
    valorMinimoKm: 0
};


/* ===== js/calculator.js ===== */
function calcular() {
    const parcela = numero("parcela");
    const seguro = numero("seguro");
    const ipva = numero("ipva") / 12;
    const internet = numero("internet");
    const lavagem = numero("lavagem");
    const extras = numero("extras");
    const lucroDesejado = numero("lucro");
    const diasMes = numero("diasMes");
    const kmDia = numero("kmDia");
    const kmMes = diasMes * kmDia;
    const alimentacao = numero("alimentacao") * diasMes;

    estadoFinanceiro.custoMensal = parcela + seguro + ipva + internet + lavagem + extras + alimentacao;

    const consumo = numero("consumo");
    estadoFinanceiro.combustivelKm = consumo > 0 ? numero("valorCombustivel") / consumo : 0;

    const trocaOleoKm = numero("trocaOleoKm");
    const oleoKm = trocaOleoKm > 0 ? numero("valorOleo") / trocaOleoKm : 0;
    const vidaPneus = numero("vidaPneus");
    const pneusKm = vidaPneus > 0 ? numero("valorPneus") / vidaPneus : 0;
    const vidaPastilhas = numero("vidaPastilhas");
    const pastilhasKm = vidaPastilhas > 0 ? numero("valorPastilhas") / vidaPastilhas : 0;
    const custoFixoKm = kmMes > 0 ? estadoFinanceiro.custoMensal / kmMes : 0;

    estadoFinanceiro.custoRealKm = custoFixoKm + estadoFinanceiro.combustivelKm + oleoKm + pneusKm + pastilhasKm;

    const metaMensal = estadoFinanceiro.custoMensal + lucroDesejado;
    const metaSemanal = metaMensal / 4.33;
    const metaDiaria = diasMes > 0 ? metaMensal / diasMes : 0;
    estadoFinanceiro.valorMinimoKm = kmMes > 0 ? metaMensal / kmMes : 0;

    atualizarCard(elementos.cards.custoMensal, estadoFinanceiro.custoMensal);
    atualizarCard(elementos.cards.combustivelKm, estadoFinanceiro.combustivelKm);
    atualizarCard(elementos.cards.custoReal, estadoFinanceiro.custoRealKm);
    atualizarCard(elementos.cards.metaDiaria, metaDiaria);
    atualizarCard(elementos.cards.metaSemanal, metaSemanal);
    atualizarCard(elementos.cards.metaMensal, metaMensal);
    atualizarCard(elementos.cards.valorKm, estadoFinanceiro.valorMinimoKm);

    elementos.painel.classList.remove("oculto");
    elementos.diagnostico.classList.remove("oculto");
    elementos.mensagemDiagnostico.textContent = "Custos calculados com sucesso.";
    window.dispatchEvent(new CustomEvent("financeiro-calculado"));
}


/* ===== js/simulator.js ===== */
function definirDiagnostico(classe, status, mensagem) {
    elementos.diagnostico.className = `container ${classe}`.trim();
    elementos.statusCorrida.textContent = status;
    elementos.mensagemDiagnostico.innerHTML = mensagem;
}

function simularCorrida() {
    const valorCorrida = numero("valorCorrida");
    const kmCorrida = numero("kmCorrida");

    if (valorCorrida <= 0 || kmCorrida <= 0) {
        alert("Informe o valor e a distância da corrida.");
        return;
    }

    const custoCorrida = estadoFinanceiro.custoRealKm * kmCorrida;
    const lucro = valorCorrida - custoCorrida;
    const lucroPorKm = lucro / kmCorrida;

    atualizarCard(elementos.cards.custoCorrida, custoCorrida);
    atualizarCard(elementos.cards.lucroCorrida, lucro);
    atualizarCard(elementos.cards.lucroKm, lucroPorKm);
    elementos.resultadoCorrida.classList.remove("oculto");
    elementos.diagnostico.classList.remove("oculto");

    if (lucro <= 0) {
        definirDiagnostico("erro", "🔴 PREJUÍZO", `<strong>❌ Corrida não recomendada</strong><br><br>Você terá um prejuízo de <strong>${moeda(Math.abs(lucro))}</strong>.<br>O custo desta corrida é maior que o valor recebido.<br><br><strong>Recomendação:</strong> recuse essa corrida.`);
    } else if (lucroPorKm < estadoFinanceiro.custoRealKm) {
        definirDiagnostico("alerta", "🟠 MUITO RUIM", `<strong>⚠ Lucro muito baixo</strong><br><br>Você ganhará apenas <strong>${moeda(lucro)}</strong> nesta corrida.<br>O retorno por quilômetro está abaixo do ideal.<br><br><strong>Recomendação:</strong> aceite somente se ajudar no seu posicionamento.`);
    } else if (lucroPorKm < estadoFinanceiro.valorMinimoKm) {
        definirDiagnostico("alerta", "🟡 ACEITÁVEL", `<strong>👍 Corrida aceitável</strong><br><br>Lucro estimado: <strong>${moeda(lucro)}</strong>.<br>Está abaixo da sua meta por quilômetro, mas ainda gera lucro.<br><br><strong>Recomendação:</strong> aceite se estiver com pouca demanda.`);
    } else if (lucroPorKm < estadoFinanceiro.valorMinimoKm * 1.30) {
        definirDiagnostico("sucesso", "🟢 BOA CORRIDA", `<strong>✅ Boa escolha</strong><br><br>Lucro estimado: <strong>${moeda(lucro)}</strong>.<br>Essa corrida atende sua meta de ganho.<br><br><strong>Recomendação:</strong> vale a pena aceitar.`);
    } else {
        definirDiagnostico("excelente", "🔵 EXCELENTE", `<strong>🚀 Excelente oportunidade</strong><br><br>Lucro estimado: <strong>${moeda(lucro)}</strong>.<br>Excelente retorno por quilômetro.<br><br><strong>Recomendação:</strong> aceite sem pensar duas vezes.`);
    }
}


/* ===== js/pdf.js ===== */
async function exportarPDF() {
    if (!window.html2canvas || !window.jspdf?.jsPDF) {
        alert("Não foi possível carregar os recursos necessários para gerar o PDF.");
        return;
    }
    const textos = {
        pdfCustoMensal: `💰 Custo Mensal: ${document.getElementById("custoMensal").textContent}`,
        pdfCustoKm: `🚗 Custo por Km: ${document.getElementById("custoReal").textContent}`,
        pdfCombustivel: `⛽ Combustível por Km: ${document.getElementById("combustivelKm").textContent}`,
        pdfMetaDiaria: `📅 Meta Diária: ${document.getElementById("metaDiaria").textContent}`,
        pdfMetaSemanal: `📅 Meta Semanal: ${document.getElementById("metaSemanal").textContent}`,
        pdfMetaMensal: `📅 Meta Mensal: ${document.getElementById("metaMensal").textContent}`,
        pdfValorKm: `🎯 Valor Mínimo por Km: ${document.getElementById("valorKm").textContent}`,
        pdfData: `Data de geração: ${new Date().toLocaleString("pt-BR")}`
    };

    Object.entries(textos).forEach(([id, texto]) => { document.getElementById(id).textContent = texto; });

    const clone = document.getElementById("relatorioPDF").cloneNode(true);
    Object.assign(clone.style, { position: "absolute", left: "0", top: "0", width: "900px", background: "#ffffff" });
    document.body.appendChild(clone);

    try {
        const canvas = await window.html2canvas(clone, { scale: 2, backgroundColor: "#ffffff" });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        const largura = 180;
        const altura = canvas.height * largura / canvas.width;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 15, 15, largura, altura);
        pdf.save("KM-Lucrativo.pdf");
    } catch {
        alert("Não foi possível gerar o relatório PDF. Tente novamente.");
    } finally {
        clone.remove();
    }
}


/* ===== js/theme.js ===== */
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
function alternarModoEscuro() {
    const escuro = !document.body.classList.contains("dark");
    aplicarTema(escuro);
    try {
        localStorage.setItem(CHAVE_TEMA, escuro ? "dark" : "light");
    } catch {
        // O tema continua funcional mesmo quando o armazenamento está indisponível.
    }
}

/** Restaura o tema salvo ou respeita a preferência do sistema operacional. */
function iniciarTema() {
    let preferencia = null;
    try {
        preferencia = localStorage.getItem(CHAVE_TEMA);
    } catch {
        preferencia = null;
    }
    const escuro = preferencia ? preferencia === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    aplicarTema(escuro);
}


/* ===== js/navigation.js ===== */
/** Controla a navegação acessível entre os painéis principais da aplicação. */
function iniciarNavegacao() {
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


/* ===== js/daily-records.js ===== */
const idsNumericos = [
    "registroHoras",
    "registroKm",
    "registroReceita",
    "registroLitros",
    "registroCombustivel",
    "registroAlimentacao",
    "registroPedagio",
    "registroEstacionamento",
    "registroOutras"
];

let registros = [];
let registroSelecionadoId = null;

function campo(id) {
    return document.getElementById(id);
}

function valorNumerico(id) {
    return Number(campo(id).value) || 0;
}

function criarRegistro() {
    return {
        id: registroSelecionadoId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        data: campo("registroData").value,
        aplicativo: campo("registroAplicativo").value,
        horasTrabalhadas: valorNumerico("registroHoras"),
        kmRodados: valorNumerico("registroKm"),
        receitaBruta: valorNumerico("registroReceita"),
        litrosAbastecidos: valorNumerico("registroLitros"),
        valorCombustivel: valorNumerico("registroCombustivel"),
        alimentacao: valorNumerico("registroAlimentacao"),
        pedagio: valorNumerico("registroPedagio"),
        estacionamento: valorNumerico("registroEstacionamento"),
        outrasDespesas: valorNumerico("registroOutras"),
        observacoes: campo("registroObservacoes").value.trim()
    };
}

function validarFormulario() {
    const formulario = campo("formRegistro");
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }

    const possuiValorInvalido = idsNumericos.some((id) => valorNumerico(id) < 0);
    if (possuiValorInvalido) {
        exibirMensagem("Os valores não podem ser negativos.", true);
        return false;
    }

    return true;
}

function exibirMensagem(texto, erro = false) {
    const mensagem = campo("mensagemRegistro");
    mensagem.textContent = texto;
    mensagem.style.color = erro ? "var(--vermelho)" : "var(--verde)";
}

function persistir() {
    try {
        salvarRegistros(registros);
        return true;
    } catch {
        exibirMensagem("Não foi possível salvar os registros neste navegador.", true);
        return false;
    }
}

function adicionarCelula(linha, texto, classe = "") {
    const celula = document.createElement("td");
    celula.textContent = texto;
    if (classe) celula.className = classe;
    linha.appendChild(celula);
}

function renderizarTabela() {
    const corpo = campo("corpoTabelaRegistros");
    corpo.replaceChildren();

    [...registros]
        .sort((a, b) => b.data.localeCompare(a.data))
        .forEach((registro) => {
            const totalDespesas = despesasRegistro(registro);
            const resultado = registro.receitaBruta - totalDespesas;
            const linha = document.createElement("tr");
            linha.dataset.id = registro.id;
            linha.classList.toggle("selecionado", registro.id === registroSelecionadoId);
            linha.setAttribute("tabindex", "0");
            linha.setAttribute("aria-label", `Selecionar registro de ${formatarData(registro.data)}`);

            adicionarCelula(linha, formatarData(registro.data));
            adicionarCelula(linha, registro.aplicativo);
            adicionarCelula(linha, `${registro.horasTrabalhadas.toLocaleString("pt-BR")} h`);
            adicionarCelula(linha, `${registro.kmRodados.toLocaleString("pt-BR")} km`);
            adicionarCelula(linha, moeda(registro.receitaBruta));
            adicionarCelula(linha, moeda(totalDespesas));
            adicionarCelula(linha, moeda(resultado), resultado >= 0 ? "resultado-positivo" : "resultado-negativo");
            adicionarCelula(linha, registro.observacoes || "—", "observacao-tabela");

            linha.addEventListener("click", () => selecionarRegistro(registro.id));
            linha.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    selecionarRegistro(registro.id);
                }
            });
            corpo.appendChild(linha);
        });

    campo("semRegistros").hidden = registros.length > 0;
}

function preencherFormulario(registro) {
    campo("registroData").value = registro.data;
    campo("registroAplicativo").value = registro.aplicativo;
    campo("registroHoras").value = registro.horasTrabalhadas;
    campo("registroKm").value = registro.kmRodados;
    campo("registroReceita").value = registro.receitaBruta;
    campo("registroLitros").value = registro.litrosAbastecidos;
    campo("registroCombustivel").value = registro.valorCombustivel;
    campo("registroAlimentacao").value = registro.alimentacao;
    campo("registroPedagio").value = registro.pedagio;
    campo("registroEstacionamento").value = registro.estacionamento;
    campo("registroOutras").value = registro.outrasDespesas;
    campo("registroObservacoes").value = registro.observacoes;
}

function selecionarRegistro(id) {
    const registro = registros.find((item) => item.id === id);
    if (!registro) return;

    registroSelecionadoId = id;
    preencherFormulario(registro);
    campo("btnEditarRegistro").disabled = false;
    campo("btnExcluirRegistro").disabled = false;
    exibirMensagem("Registro selecionado. Altere os campos e clique em Editar.");
    renderizarTabela();
}

function limparFormulario() {
    campo("formRegistro").reset();
    campo("registroData").value = hojeISO();
    registroSelecionadoId = null;
    campo("btnEditarRegistro").disabled = true;
    campo("btnExcluirRegistro").disabled = true;
    renderizarTabela();
}

function salvarNovoRegistro(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    const novoRegistro = criarRegistro();
    novoRegistro.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    registros.push(novoRegistro);
    if (!persistir()) {
        registros.pop();
        return;
    }

    limparFormulario();
    exibirMensagem("Registro salvo com sucesso.");
}

function editarRegistro() {
    if (!registroSelecionadoId || !validarFormulario()) return;
    const indice = registros.findIndex((item) => item.id === registroSelecionadoId);
    if (indice < 0) return;

    const anterior = registros[indice];
    registros[indice] = criarRegistro();
    if (!persistir()) {
        registros[indice] = anterior;
        return;
    }

    limparFormulario();
    exibirMensagem("Registro atualizado com sucesso.");
}

function excluirRegistro() {
    if (!registroSelecionadoId) return;
    const indice = registros.findIndex((item) => item.id === registroSelecionadoId);
    if (indice < 0) return;

    const [removido] = registros.splice(indice, 1);
    if (!persistir()) {
        registros.splice(indice, 0, removido);
        return;
    }

    limparFormulario();
    exibirMensagem("Registro excluído com sucesso.");
}

function iniciarRegistrosDiarios() {
    registros = carregarRegistros();
    campo("registroData").value = hojeISO();
    campo("formRegistro").addEventListener("submit", salvarNovoRegistro);
    campo("btnEditarRegistro").addEventListener("click", editarRegistro);
    campo("btnExcluirRegistro").addEventListener("click", excluirRegistro);
    renderizarTabela();
}


/* ===== js/dashboard.js ===== */
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

function atualizarDashboard() {
    const registros = registrosFiltrados();
    atualizarDescricaoPeriodo();
    atualizarMetricas(registros);
    atualizarGraficos(registros);
    atualizarMetas();
}

function iniciarDashboard() {
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


/* ===== js/intelligence.js ===== */
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

function atualizarAnaliseInteligente() {
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

function iniciarAnaliseInteligente() {
    window.addEventListener("registros-atualizados", atualizarAnaliseInteligente);
    window.addEventListener("financeiro-calculado", atualizarAnaliseInteligente);
    window.addEventListener("configuracoes-atualizadas", atualizarAnaliseInteligente);
    atualizarAnaliseInteligente();
}


/* ===== js/app.js ===== */
function init() {
    elementos.btnCalcular.addEventListener("click", calcular);
    elementos.btnSimular.addEventListener("click", simularCorrida);
    elementos.btnModoEscuro.addEventListener("click", alternarModoEscuro);
    elementos.btnPDF.addEventListener("click", exportarPDF);
    document.getElementById("btnTemaConfiguracoes").addEventListener("click", alternarModoEscuro);

    iniciarTema();
    iniciarNavegacao();
    iniciarRegistrosDiarios();
    iniciarConfiguracoes();
    iniciarBackup();
    iniciarDashboard();
    iniciarAnaliseInteligente();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}

})();
