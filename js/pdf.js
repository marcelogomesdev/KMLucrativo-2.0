export async function exportarPDF() {
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
