import { calcular } from "./calculator.js";
import { elementos } from "./dom.js";
import { exportarPDF } from "./pdf.js";
import { simularCorrida } from "./simulator.js";
import { alternarModoEscuro, iniciarTema } from "./theme.js";
import { iniciarNavegacao } from "./navigation.js";
import { iniciarRegistrosDiarios } from "./daily-records.js";
import { iniciarDashboard } from "./dashboard.js";
import { iniciarAnaliseInteligente } from "./intelligence.js";
import { iniciarConfiguracoes } from "./settings.js";
import { iniciarBackup } from "./backup.js";

export function init() {
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
