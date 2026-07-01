import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import Venda from './components/cadastro/Venda'
import Gasto from './components/cadastro/Gasto'
import Manutencao from './components/cadastro/Manutencao'
import Troca from './components/cadastro/Troca'
import Consultas from './components/Consultas'
import Estoque from './components/Estoque'
import Automovel from './components/cadastro/Automovel'
import Detalhes from './components/Detalhes'
import DetalhesConsignacao from './components/detalhes/DetalhesConsignacao'
import DetalhesCompra from './components/detalhes/DetalhesCompra'
import DetalhesTroca from './components/detalhes/DetalhesTroca'
import DetalhesVenda from './components/detalhes/DetalhesVenda'
import DetalhesGasto from './components/detalhes/DetalhesGasto'
import DetalhesManutencao from './components/detalhes/DetalhesManutencao'
import Compra from './components/cadastro/Compra'
import Consignacao from './components/cadastro/Consignacao'
import EditarAutomovel from './components/editar/EditarAutomovel'
import EditarConsignacao from './components/editar/EditarConsignacao'
import EditarCompra from './components/editar/EditarCompra'
import EditarTroca from './components/editar/EditarTroca'
import EditarVenda from './components/editar/EditarVenda'
import EditarGasto from './components/editar/EditarGasto'
import EditarCliente from './components/editar/EditarCliente'
import EditarManutencao from './components/editar/EditarManutencao'
import Historico from './components/cadastro/Historico'
import Cliente from './components/cadastro/Cliente'
import ListCompras from './components/listagem/ListCompras'
import ListConsignacao from './components/listagem/ListConsignacao'
import ListTrocas from './components/listagem/ListTrocas'
import ListVendas from './components/listagem/ListVendas'
import ListGastos from "./components/listagem/ListGastos"
import ListManutencoes from "./components/listagem/ListManutencoes"
import ListClientes from './components/listagem/ListClientes'
import ProtectedRoute from './components/RotaProtegida'
import AcessoNegado from './components/AcessoNegado'
import ListVendedores from './components/listagem/ListVendedores'
import RegistroVendedor from './components/cadastro/Vendedor'
import ResetarSenha from './components/ResetarSenha'
import GerenciarComissoes from './components/GerenciarComissoes'
import AlterarSenha from './components/AlterarSenha'
import 'react-toastify/dist/ReactToastify.css';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Carregando...</div>;

  if (user && user.precisa_alterar_senha && location.pathname !== '/primeiro-acesso/alterar-senha') {
    return <Navigate to="/primeiro-acesso/alterar-senha" replace />;
  }

  return <Outlet />;
};

function App() {

  const location = useLocation();

  useEffect(() => {

    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

  }, [location]);


  return (
    <>
      <div className='App'>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/primeiro-acesso/alterar-senha" element={<AlterarSenha />} />
          <Route path="/resetar-senha/:token" element={<ResetarSenha />} />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/venda" element={<Venda />}></Route>
            <Route path="/troca" element={<Troca />}></Route>
            <Route path="/estoque" element={<Estoque />}></Route>
            <Route path="/cadastro/automoveis" element={<Automovel />}></Route>
            <Route path="/detalhes/:id" element={<Detalhes />}></Route>
            <Route path="/detalhes-consignacao/:id" element={<DetalhesConsignacao />}></Route>
            <Route path="/detalhes-compra/:id" element={<DetalhesCompra />}></Route>
            <Route path="/detalhes-troca/:id" element={<DetalhesTroca />}></Route>
            <Route path="/detalhes-venda/:id" element={<DetalhesVenda />}></Route>
            <Route path="/detalhes-gasto/:id" element={<DetalhesGasto />}></Route>
            <Route path="/detalhes-manutencao/:id" element={<DetalhesManutencao />}></Route>
            <Route path='/consignacao' element={<Consignacao />}></Route>
            <Route path='/editar-automovel/:id' element={<EditarAutomovel />}></Route>
            <Route path="/editar-cliente/:id" element={<EditarCliente />} />
            <Route path='/historico' element={<Historico />}></Route>
            <Route path='/cliente' element={<Cliente />}></Route>
            <Route path='/listagem/compras' element={<ListCompras />}></Route>
            <Route path='/listagem/consignacoes' element={<ListConsignacao />}></Route>
            <Route path='/listagem/trocas' element={<ListTrocas />}></Route>
            <Route path='/listagem/vendas' element={<ListVendas />}></Route>
            <Route path='/listagem/gastos' element={<ListGastos />}></Route>
            <Route path='/listagem/manutencoes' element={<ListManutencoes />}></Route>
            <Route path="/listagem/clientes" element={<ListClientes />} />
            <Route path="/acesso-negado" element={<AcessoNegado />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['gerente']} />}>
            <Route path="/compra" element={<Compra />}></Route>
            <Route path="/consultas" element={<Consultas />}></Route>
            <Route path="/manutencao" element={<Manutencao />}></Route>
            <Route path="/gastos" element={<Gasto />}></Route>
            <Route path='/editar-gasto/:id' element={<EditarGasto />}></Route>
            <Route path='/editar-manutencao/:id' element={<EditarManutencao />}></Route>
            <Route path='/editar-consignacao/:id' element={<EditarConsignacao />}></Route>
            <Route path='/editar-compra/:id' element={<EditarCompra />}></Route>
            <Route path='/editar-troca/:id' element={<EditarTroca />}></Route>
            <Route path='/editar-venda/:id' element={<EditarVenda />}></Route>
            <Route path='/listagem/vendedores' element={<ListVendedores />}></Route>
            <Route path='/vendedor' element={<RegistroVendedor />}></Route>
            <Route path="/gerenciar/comissoes" element={<GerenciarComissoes />}></Route>/
          </Route>

        </Routes>

      </div >
    </>
  )
}

export default App
