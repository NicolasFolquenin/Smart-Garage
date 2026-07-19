import { useState, useEffect, useMemo } from 'react';
import AutomovelDataService from "../services/automovelDataService";
import MarcaDataService from "../services/marcaDataService";
import ModeloDataService from "../services/modeloDataService";
import VendaDataService from "../services/vendaDataService";

export const useEstoque = (opcao, search) => {
    const [automovel, setAutomovel] = useState([]);
    const [automovelInativo, setAutomovelInativo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            AutomovelDataService.getByAtivo(),
            AutomovelDataService.getByInativo(),
            MarcaDataService.getAll(),
            ModeloDataService.getAll(),
            VendaDataService.getAll(),
        ]).then(([automoveisRes, automoveisInativos, marcasRes, modelosRes, vendasRes]) => {
            setAutomovel(automoveisRes.data);
            setAutomovelInativo(automoveisInativos.data);
            setMarca(marcasRes.data);
            setModelo(modelosRes.data);
            setVendas(vendasRes.data);
        }).catch(e => {
            console.error("Erro ao carregar dados do estoque:", e);
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const automoveisFiltrados = useMemo(() => {
        let listaBase;

        switch (opcao) {
            case 'inativos':
                listaBase = automovelInativo;
                break;
            case 'vendidos':
                const idsVendidos = new Set(vendas.map(v => v.automovelId));
                listaBase = automovelInativo.filter(auto => idsVendidos.has(auto.id));
                break;
            case 'ativos':
            default:
                listaBase = automovel;
                break;
        }

        if (!search) return listaBase;

        return listaBase.filter(auto => {
            const marca2 = marca.find(m => m.id === auto.marcaId);
            const modelo2 = modelo.find(m => m.id === auto.modeloId);
            const searchTerm = search.toLowerCase();

            return (
                modelo2?.nome.toLowerCase().includes(searchTerm) ||
                marca2?.nome.toLowerCase().includes(searchTerm) ||
                auto.ano_fabricacao.toString().includes(searchTerm) ||
                auto.placa.toLowerCase().includes(searchTerm)
            );
        });
    }, [search, opcao, automovel, automovelInativo, modelo, marca, vendas]);

    return {
        automoveisFiltrados,
        loading,
        error,
        marca,
        modelo
    };
};
