import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loaded components
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const Venda = lazy(() => import('./components/cadastro/Venda'));
const Gasto = lazy(() => import('./components/cadastro/Gasto'));
const Manutencao = lazy(() => import('./components/cadastro/Manutencao'));
const Troca = lazy(() => import('./components/cadastro/Troca'));
const Consultas = lazy(() => import('./components/Consultas'));
const Estoque = lazy(() => import('./components/Estoque'));
const Automovel = lazy(() => import('./components/cadastro/Automovel'));
const Detalhes = lazy(() => import('./components/Detalhes'));
const DetalhesConsignacao = lazy(() => import('./components/detalhes/DetalhesConsignacao'));
const DetalhesCompra = lazy(() => import('./components/detalhes/DetalhesCompra'));
const DetalhesTroca = lazy(() => import('./components/detalhes/DetalhesTroca'));
const DetalhesVenda = lazy(() => import('./components/detalhes/DetalhesVenda'));
const DetalhesGasto = lazy(() => import('./components/detalhes/DetalhesGasto'));
const DetalhesManutencao = lazy(() => import('./components/detalhes/DetalhesManutencao'));
const Compra = lazy(() => import('./components/cadastro/Compra'));
const Consignacao = lazy(() => import('./components/cadastro/Consignacao'));
const EditarAutomovel = lazy(() => import('./components/editar/EditarAutomovel'));
const EditarConsignacao = lazy(() => import('./components/editar/EditarConsignacao'));
const EditarCompra = lazy(() => import('./components/editar/EditarCompra'));
const EditarTroca = lazy(() => import('./components/editar/EditarTroca'));
const EditarVenda = lazy(() => import('./components/editar/EditarVenda'));
const EditarGasto = lazy(() => import('./components/editar/EditarGasto'));
const EditarCliente = lazy(() => import('./components/editar/EditarCliente'));
const EditarManutencao = lazy(() => import('./components/editar/EditarManutencao'));
const Historico = lazy(() => import('./components/cadastro/Historico'));
const Cliente = lazy(() => import('./components/cadastro/Cliente'));
const ListCompras = lazy(() => import('./components/listagem/ListCompras'));
const ListConsignacao = lazy(() => import('./components/listagem/ListConsignacao'));
const ListTrocas = lazy(() => import('./components/listagem/ListTrocas'));
const ListVendas = lazy(() => import('./components/listagem/ListVendas'));
const ListGastos = lazy(() => import('./components/listagem/ListGastos'));
const ListManutencoes = lazy(() => import('./components/listagem/ListManutencoes'));
const ListClientes = lazy(() => import('./components/listagem/ListClientes'));
const ProtectedRoute = lazy(() => import('./components/RotaProtegida'));
const AcessoNegado = lazy(() => import('./components/AcessoNegado'));
const ListVendedores = lazy(() => import('./components/listagem/ListVendedores'));
const RegistroVendedor = lazy(() => import('./components/cadastro/Vendedor'));
const ResetarSenha = lazy(() => import('./components/ResetarSenha'));
const GerenciarComissoes = lazy(() => import('./components/GerenciarComissoes'));
const AlterarSenha = lazy(() => import('./components/AlterarSenha'));

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
        <Suspense fallback={
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        }>
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
              <Route path="/manutencao" element={<Manutencao />}></Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['gerente']} />}>
              <Route path="/compra" element={<Compra />}></Route>
              <Route path="/consultas" element={<Consultas />}></Route>
              <Route path="/gastos" element={<Gasto />}></Route>
              <Route path='/editar-gasto/:id' element={<EditarGasto />}></Route>
              <Route path='/editar-manutencao/:id' element={<EditarManutencao />}></Route>
              <Route path='/editar-consignacao/:id' element={<EditarConsignacao />}></Route>
              <Route path='/editar-compra/:id' element={<EditarCompra />}></Route>
              <Route path='/editar-troca/:id' element={<EditarTroca />}></Route>
              <Route path='/editar-venda/:id' element={<EditarVenda />}></Route>
              <Route path='/listagem/vendedores' element={<ListVendedores />}></Route>
              <Route path='/vendedor' element={<RegistroVendedor />}></Route>
              <Route path="/gerenciar/comissoes" element={<GerenciarComissoes />}></Route>
            </Route>

          </Routes>
        </Suspense>
      </div >
    </>
  )
}

export default App
