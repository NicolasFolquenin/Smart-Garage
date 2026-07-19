export const calcularSumarioRelatorio = (dadosRelatorio, tipo) => {
    if (!dadosRelatorio || dadosRelatorio.length === 0) {
        return null;
    }

    const quantidadeRegistros = dadosRelatorio.length;

    if (tipo === 'Venda') {
        const lucroTotal = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.lucro || 0), 0);
        const valorTotalVendido = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
        const margemMedia = valorTotalVendido > 0 ? (lucroTotal / valorTotalVendido) * 100 : 0;

        return {
            quantidadeRegistros,
            valorTotal: valorTotalVendido,
            lucroTotal,
            margemMedia
        };
    } else if (tipo === 'Troca') {
        const totalRecebido = dadosRelatorio
            .filter(item => parseFloat(item.valor) > 0)
            .reduce((acc, item) => acc + parseFloat(item.valor), 0);

        const totalPago = dadosRelatorio
            .filter(item => parseFloat(item.valor) < 0)
            .reduce((acc, item) => acc + Math.abs(parseFloat(item.valor)), 0);

        const saldoFinal = totalRecebido - totalPago;

        return {
            quantidadeRegistros,
            totalRecebido,
            totalPago,
            saldoFinal,
        };
    } else if (tipo === 'BalancoGeral') {
        const receitas = dadosRelatorio
            .filter(item => item.tipo_transacao === 'Venda')
            .reduce((acc, item) => acc + parseFloat(item.lucro || 0), 0);

        const despesas = dadosRelatorio
            .filter(item => ['Gasto', 'Manutencao'].includes(item.tipo_transacao))
            .reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);

        const saldo = receitas - despesas;

        return {
            quantidadeRegistros,
            receitas,
            despesas,
            saldo
        };
    } else {
        const valorTotal = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
        const ticketmedio = valorTotal / quantidadeRegistros;

        return {
            valorTotal,
            quantidadeRegistros,
            ticketmedio,
        };
    }
};
