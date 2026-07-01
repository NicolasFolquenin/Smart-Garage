import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';

const logoUrl = '/static/img/logo.png';

const gerarPDF = async (dados, sumario, filtros, graficoElement) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    const margin = {
        top: 20,
        right: 15,
        bottom: 20,
        left: 15,
    };

    const usableWidth = pageWidth - margin.left - margin.right;
    let finalY = margin.top;

    const formatLocalDate = (dateString, formatStr = 'dd/MM/yy') => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            // Adiciona o offset do fuso horário local para anular a conversão automática do JS
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
            return format(correctedDate, formatStr, { locale: ptBR });
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return "Data Inválida";
        }
    };

    const addPageNumbers = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth - margin.right,
                margin.top - 10,
                { align: 'right' }
            );
        }
    };

    // --- CABEÇALHO ---
    const addHeader = () => {

        try {
            const img = new Image();
            img.src = logoUrl;
            doc.addImage(img, 'PNG', margin.left, margin.top - 8, 25, 10);
        } catch (e) {
            console.error("Logo não encontrado. Verifique o caminho.", e);
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Rodrigo Veículos', pageWidth / 2, margin.top, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - margin.right, margin.top + 5, { align: 'right' });

        finalY += 10; // Espaçamento após o cabeçalho
        doc.line(margin.left, finalY, pageWidth - margin.right, finalY);
        finalY += 10; // Espaçamento para o título
    };

    // --- TÍTULO E FILTROS ---
    const addTitleAndFilters = () => {
        const nomeRelatorio = `Relatório Gerencial de ${filtros.tipo}`;

        const dataInicioFmt = formatLocalDate(filtros.dataInicio, "dd 'de' MMMM 'de' yyyy");
        const dataFimFmt = formatLocalDate(filtros.dataFim, "dd 'de' MMMM 'de' yyyy");
        const periodoTexto = `Período: ${dataInicioFmt} a ${dataFimFmt}`;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(nomeRelatorio, margin.left, finalY);
        finalY += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(periodoTexto, margin.left, finalY);
        finalY += 12;
    };

    // --- SUMÁRIO ---
    const addSummaryCards = () => {
        if (!sumario) return;

        doc.setFontSize(10);
        const cardHeight = 20;
        const cardY = finalY;
        let currentX = margin.left;
        const cardGap = 4;;

        const drawCard = (title, value, cardWidth = 45, valueColor = [0, 0, 0]) => {
            doc.setDrawColor(200, 200, 200);
            doc.rect(currentX, cardY, cardWidth, cardHeight);

            doc.setTextColor(128, 128, 128);
            doc.setFont('helvetica', 'normal');
            doc.text(title, currentX + cardWidth / 2, cardY + 7, { align: 'center' });

            doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(value, currentX + cardWidth / 2, cardY + 15, { align: 'center' });

            currentX += cardWidth + 5;
        };

        switch (filtros.tipo) {
            case 'Venda':
                const cardWidthVenda = (usableWidth - (cardGap * 3)) / 4;
                drawCard('Total de Vendas', sumario.quantidadeRegistros.toString(), cardWidthVenda);
                drawCard('Valor Total Vendido', (sumario.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthVenda);
                drawCard('Lucro Bruto Total', (sumario.lucroTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthVenda);
                drawCard('Margem Média', `${(sumario.margemMedia ?? 0).toFixed(2)}%`, cardWidthVenda);
                break;

            case 'Troca':
                const cardWidthTroca = (usableWidth - (cardGap * 3)) / 4;
                drawCard('Total de Trocas', sumario.quantidadeRegistros.toString(), cardWidthTroca);
                drawCard('Total Recebido', (sumario.totalRecebido ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthTroca);
                drawCard('Total Pago', (sumario.totalPago ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthTroca);
                // const saldoColor = (sumario.saldoFinal ?? 0) >= 0 ? [25, 135, 84] : [220, 53, 69];
                drawCard('Saldo Final', (sumario.saldoFinal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthTroca);
                break;

            // Caso padrão para outros relatórios (Gasto, Compra, etc.)
            default:
                const cardWidthDefault = (usableWidth - (cardGap * 2)) / 3; // Largura para 3 cards
                drawCard('Total de Registros', sumario.quantidadeRegistros.toString(), cardWidthDefault);
                drawCard('Valor Total', (sumario.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthDefault);
                drawCard('Ticket Médio', (sumario.ticketmedio ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cardWidthDefault);
                break;
        }

        finalY = cardY + cardHeight + 12;
    };


    // --- CONTEÚDO: TABELA ---
    const addContentTable = () => {
        let headers, body;

        switch (filtros.tipo) {
            case 'Venda':
                headers = [["Data", "Cliente", "Automóvel (Placa)", "Valor", "Comissão", "Lucro"]];
                body = dados.map(item => [
                    formatLocalDate(item.data),
                    item.cliente?.nome || 'N/A',
                    item.automovel?.placa || 'N/A',
                    parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    parseFloat(item.comissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    parseFloat(item.lucro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                ]);
                break;
            case 'Troca':
                headers = [["Data", "Cliente", "Automóvel Recebido (Placa)", "Valor Diferença", "Comissão"]];
                body = dados.map(item => [
                    formatLocalDate(item.data),
                    item.cliente?.nome || 'N/A',
                    item.automovel?.placa || 'N/A',
                    parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    parseFloat(item.comissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                ]);
                break;
            case 'Compra':
                headers = [["Data", "Fornecedor", "Automóvel (Placa)", "Valor"]];
                body = dados.map(item => [
                    formatLocalDate(item.data),
                    item.cliente?.nome || 'N/A',
                    item.automovel?.placa || 'N/A',
                    parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                ]);
                break;
            case 'Consignacao':
                headers = [["Data Início", "Consignante", "Automóvel (Placa)", "Valor", "Situação"]];
                body = dados.map(item => [
                    formatLocalDate(item.data_inicio),
                    item.cliente?.nome || 'N/A',
                    item.automovel?.placa || 'N/A',
                    parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    item.ativo ? "Ativa" : "Inativa"
                ]);
                break;

            default:
                headers = [["Data", "Descrição", "Automóvel (Placa)", "Valor"]];
                body = dados.map(item => [
                    formatLocalDate(item.data || item.data_envio),
                    item.descricao || item.cliente?.nome,
                    item.automovel?.placa || 'N/A',
                    parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                ]);
        }

        autoTable(doc, {
            startY: finalY,
            head: headers,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [128, 128, 128] },
            margin: { left: margin.left, right: margin.right },
            columnStyles: {
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' }
            }
        });

        finalY = doc.lastAutoTable.finalY + 10;
    };

    // --- GRÁFICO ---
    const addChart = async () => {
        if (!graficoElement) {
            console.warn("Elemento do gráfico não encontrado para gerar o PDF.");
            return;
        }

        if (finalY + 80 > pageHeight - margin.bottom) {
            doc.addPage();
            finalY = margin.top;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const canvas = await html2canvas(graficoElement, {
                useCORS: true,
                scale: 3,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const margin = 15;

            const imgWidth = pdfWidth - margin * 2;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            const chartTitleY = finalY + 15;
            doc.text("Desempenho no Período", margin, chartTitleY);

            const chartY = chartTitleY + 5;

            if (chartY + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                finalY = margin;
                doc.text("Desempenho no Período", margin, finalY + 5);
                doc.addImage(imgData, 'PNG', margin, finalY + 10, imgWidth, imgHeight);
            } else {
                doc.addImage(imgData, 'PNG', margin, chartY, imgWidth, imgHeight);
            }

            // doc.addImage(imgData, 'PNG', margin.left, finalY, usableWidth, 80);
            // doc.addImage(imgData, 'PNG', margin, 150, imgWidth, imgHeight);

            finalY += 90;

        } catch (error) {
            console.error("Erro ao gerar a imagem do gráfico:", error);
            doc.setTextColor(255, 0, 0);
            doc.text("Não foi possível renderizar o gráfico.", margin.left, finalY);
            finalY += 10;
        }
    };


    // --- MONTAGEM DO PDF ---
    addHeader();
    addTitleAndFilters();
    addSummaryCards();
    addContentTable();

    await addChart();

    addPageNumbers();

    // Salva o arquivo
    doc.save(`Relatorio_${filtros.tipo}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export default gerarPDF;