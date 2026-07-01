import Header from '../Header';
import CompraDataService from '../../services/compraDataService';
import ConsignacaoDataService from '../../services/consignacaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useCallback, useEffect } from 'react';
import automovelDataService from '../../services/automovelDataService';

const Historico = () => {

    const [compra, setCompra] = useState([]);
    const [troca, setTroca] = useState([]);
    const [venda, setVenda] = useState([]);
    const [consignacao, setConsignacao] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [opcao, setOpcao] = useState('');


    const handleInputChangeOpcao = event => {
        const { value } = event.target;
        setOpcao(value);
    }

    useEffect(() => {
        CompraDataService.getAll().then(res => setCompra(res.data)).catch(console.error);
        ConsignacaoDataService.getAll().then(res => setConsignacao(res.data)).catch(console.error);
        AutomovelDataService.getAll().then(res => setAutomovel(res.data)).catch(console.error);
        ModeloDataService.getAll().then(res => setModelo(res.data)).catch(console.error);
        MarcaDataService.getAll().then(res => setMarca(res.data)).catch(console.error);
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 15;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const recordsCompra = compra.slice(firstIndex, lastIndex);
    const npageCompra = Math.ceil(compra.length / recordsPerPage);
    const numbersCompra = [...Array(npageCompra + 1).keys()].slice(1);

    const recordsConsignacao = consignacao.slice(firstIndex, lastIndex);
    const npageConsignacao = Math.ceil(consignacao.length / recordsPerPage);
    const numbersConsignacao = [...Array(npageConsignacao + 1).keys()].slice(1);



    function nextPage() {
        if (currentPage !== 5) {
            setCurrentPage(currentPage + 1)
        }
    }

    function prePage() {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    function changeCPage(id) {
        setCurrentPage(id)
    }


    return (
        <>
            <Header />
            <div className="container">
                <h1>HISTÓRICO</h1>

                <form>
                    <div className="row">
                        <div className="mb-3 col-md-4">
                            <label htmlFor="opcao" className="form-label">Histórico</label>
                            <select className="form-select" id="opcao" name="opcao" onChange={handleInputChangeOpcao}>
                                <option value="">Selecione a opção</option>
                                <option value="Compra">Compra</option>
                                <option value="Consignacao">Consignação</option>
                                <option value="Troca">Troca</option>
                                <option value="Venda">Venda</option>
                            </select>
                        </div>
                    </div>
                </form>



                {opcao === 'Compra' && (
                    compra.length > 0 ? (
                        <>
                            <table className="table mt-4">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Data</th>
                                        <th scope="col">Automóvel</th>
                                        <th scope="col">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordsCompra.map((d, i) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                        return (
                                            <tr key={d.id}>
                                                <th scope="row">{d.id}</th>
                                                <td>{d.data}</td>
                                                <td>{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</td>
                                                <td>{d.valor}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <nav className="col-md-9 mt-3"></nav>
                            <nav className="mt-3 col-md-3">
                                <ul className="pagination">
                                    <li className="page-item">
                                        <span className="page-link pointer" href="#" onClick={prePage}>
                                            Previous</span>
                                    </li>
                                    {
                                        numbersCompra.map((n, i) => (
                                            <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                                                <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                    {n}</span>
                                            </li>
                                        ))
                                    }
                                    <li className="page-item">
                                        <span className="page-link pointer" href="#" onClick={nextPage}>
                                            Next
                                        </span>
                                    </li>
                                </ul>
                            </nav>
                        </>
                    ) : (

                        <p className="mt-3">Sem resultados encontrados!</p>

                    )
                )}



                {opcao === 'Consignacao' && (
                    consignacao.length > 0 ? (
                        <>
                            <table className="table mt-4">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Data Início</th>
                                        <th scope="col">Automóvel</th>
                                        <th scope="col">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordsConsignacao.map((d, i) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                        return (
                                            <tr key={d.id}>
                                                <th scope="row">{d.id}</th>
                                                <td>{d.data_inicio}</td>
                                                <td>{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</td>
                                                <td>{d.valor}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <nav className="col-md-9 mt-3"></nav>
                            <nav className="mt-3 col-md-3">
                                <ul className="pagination">
                                    <li className="page-item">
                                        <span className="page-link pointer" href="#" onClick={prePage}>
                                            Previous</span>
                                    </li>
                                    {
                                        numbersConsignacao.map((n, i) => (
                                            <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                                                <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                    {n}</span>
                                            </li>
                                        ))
                                    }
                                    <li className="page-item">
                                        <span className="page-link pointer" href="#" onClick={nextPage}>
                                            Next
                                        </span>
                                    </li>
                                </ul>
                            </nav>
                        </>
                    ) : (

                        <p className="mt-3">Sem resultados encontrados!</p>

                    )
                )}

            </div>
        </>
    );

}

export default Historico;