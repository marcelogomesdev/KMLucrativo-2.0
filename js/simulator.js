import { elementos } from "./dom.js";
import { estadoFinanceiro } from "./state.js";
import { atualizarCard, moeda, numero } from "./utils.js";

function definirDiagnostico(classe, status, mensagem) {
    elementos.diagnostico.className = `container ${classe}`.trim();
    elementos.statusCorrida.textContent = status;
    elementos.mensagemDiagnostico.innerHTML = mensagem;
}

export function simularCorrida() {
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
