import { elementos } from "./dom.js";
import { estadoFinanceiro } from "./state.js";
import { atualizarCard, numero } from "./utils.js";

export function calcular() {
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
