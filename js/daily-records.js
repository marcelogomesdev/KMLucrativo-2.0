import { carregarRegistros, salvarRegistros } from "./storage.js";
import { moeda } from "./utils.js";
import { despesasRegistro } from "./financial-data.js";
import { formatarData, hojeISO } from "./date-utils.js";

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

export function iniciarRegistrosDiarios() {
    registros = carregarRegistros();
    campo("registroData").value = hojeISO();
    campo("formRegistro").addEventListener("submit", salvarNovoRegistro);
    campo("btnEditarRegistro").addEventListener("click", editarRegistro);
    campo("btnExcluirRegistro").addEventListener("click", excluirRegistro);
    renderizarTabela();
}
