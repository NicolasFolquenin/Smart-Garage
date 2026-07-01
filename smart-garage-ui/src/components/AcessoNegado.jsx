import { Link } from 'react-router-dom';
const AcessoNegado = () => (
    <div className="container text-center mt-5">
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para visualizar esta página.</p>
        <Link to="/home" className="btn btn-primary">Voltar para a Home</Link>
    </div>
);
export default AcessoNegado;