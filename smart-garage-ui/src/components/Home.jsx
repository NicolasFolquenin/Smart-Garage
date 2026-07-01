import { Link } from "react-router-dom";
import Header from "./Header";
import ModalConsignacao from "./modais/ModalConsignacao";
import { useState } from "react";
import "../../public/static/style.css";
import { useAuth } from '../context/AuthContext';
import HelpPopover from './HelpPopover';

const Home = () => {

    const { user } = useAuth();

    return (
        <>
            <Header />

            <div className="container py-5">
                <div className="page-header mb-5">
                    <div className="d-flex align-items-center">
                        <h1 className="display-5 fw-bold me-2">Bem-vindo, {user.nome}!</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Painel Principal"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta é a sua central de navegação. A partir daqui, você pode acessar rapidamente os principais módulos do sistema para gerenciar as operações da sua garagem.
                                    </p>
                                    <strong>Funcionalidades:</strong>
                                    <ul className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Navegação Rápida:</strong> Use os cards para ir diretamente para as seções de Consignações, Estoque, Manutenções, Trocas, e outras áreas importantes. Basta clicar no botão "Acessar".
                                        </li>
                                        <li className="mb-1">
                                            <strong>Menu:</strong> Ao clicar no ícone de Menu no canto superior direito, você terá acesso ao restante dos componentes do sistema que não estão listados nos cards principais.
                                        </li>
                                        <li>
                                            <strong>Acesso por Perfil:</strong> Os módulos exibidos podem variar dependendo do seu nível de acesso (Vendedor ou Gerente).
                                        </li>
                                    </ul>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted fs-5">Selecione uma das opções abaixo para começar a gerenciar sua garagem.</p>
                </div>

                <div className="row row-cols-1 row-cols-md-3 g-4">

                    <div className="col">
                        <div className="card h-100 text-center p-3 card-hover" >
                            <div className="card-body d-flex flex-column">
                                <img src="/static/img/car.png" alt="Consignação" className="mx-auto mb-3" style={{ width: "64px" }} />
                                <h3 className="card-title  mb-3">Consignações</h3>
                                <p className="card-text text-muted mb-5">Cadastre um automóvel em consignação, gerencie contratos e valores.</p>
                                <Link to="/listagem/consignacoes" className="btn btn-primary mt-auto">Acessar</Link>
                            </div>
                        </div>
                    </div>

                    <div className="col">
                        <div className="card h-100 text-center p-3 card-hover">
                            <div className="card-body d-flex flex-column">
                                <img src="/static/img/files.png" alt="Estoque" className="mx-auto mb-3" style={{ width: "64px" }} />
                                <h3 className="card-title mb-3">Estoque</h3>
                                <p className="card-text text-muted mb-5">Verifique todos os automóveis disponíveis e suas informações detalhadas.</p>
                                <Link to="/estoque" className="btn btn-primary mt-auto">Acessar</Link>
                            </div>
                        </div>
                    </div>

                    {user.role === "gerente" ?
                        (<div className="col">
                            <div className="card h-100 text-center p-3 card-hover">
                                <div className="card-body d-flex flex-column">
                                    <img src="/static/img/wrench.png" alt="Manutenções" className="mx-auto mb-3" style={{ width: "64px" }} />
                                    <h3 className="card-title h4 mb-3">Manutenções</h3>
                                    <p className="card-text text-muted mb-5">Acompanhe os gastos e o andamento das manutenções dos automóveis.</p>
                                    <Link to="/listagem/manutencoes" className="btn btn-primary mt-auto">Acessar</Link>
                                </div>
                            </div>
                        </div>) : (
                            <div className="col">
                                <div className="card h-100 text-center p-3 card-hover">
                                    <div className="card-body d-flex flex-column">
                                        <img src="/static/img/troca.png" alt="Trocas" className="mx-auto mb-3" style={{ width: "64px" }} />
                                        <h3 className="card-title h4 mb-3">Trocas</h3>
                                        <p className="card-text text-muted mb-5">Registre uma troca, gerencie informações dos automóveis envolvidos e valores.</p>
                                        <Link to="/listagem/trocas" className="btn btn-primary mt-auto">Acessar</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default Home;