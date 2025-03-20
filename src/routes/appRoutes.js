"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Login from "../pages/login/login"
import Cadastro from "../pages/login/cadastro"
import CriarSenha from "../pages/login/criarSenha"
import Home from "../pages/home/Home"
import Calendario from "../pages/calendario/Calendario"
import PedidoForm from "../pages/pedidos/PedidosForm"
import GerenciarEmpresa from "../pages/empresa/GerenciarEmpresa"
import CadastroEmpresa from "../pages/empresa/CadastroEmpresa"
import ListaFuncionarios from "../pages/funcionario/ListaFuncionarios"
import CadastroFuncionario from "../pages/funcionario/CadastroFuncionarios"

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  return usuario ? children : <Navigate to="/" />
}

// Componente para rotas de admin
const AdminRoute = ({ children }) => {
  const { usuario, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!usuario) {
    return <Navigate to="/" />
  }

  const isAdmin = usuario.user_metadata?.isAdmin || false

  return isAdmin ? children : <Navigate to="/home" />
}

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/criar-senha" element={<CriarSenha />} />

        {/* Rotas protegidas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <Calendario />
            </PrivateRoute>
          }
        />

        <Route
          path="/novo-pedido"
          element={
            <PrivateRoute>
              <PedidoForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/editar-pedido/:id"
          element={
            <PrivateRoute>
              <PedidoForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/empresa"
          element={
            <PrivateRoute>
              <GerenciarEmpresa />
            </PrivateRoute>
          }
        />

        <Route
          path="/cadastro-empresa"
          element={
            <PrivateRoute>
              <CadastroEmpresa />
            </PrivateRoute>
          }
        />

        {/* Rotas de admin */}
        <Route
          path="/funcionarios"
          element={
            <AdminRoute>
              <ListaFuncionarios />
            </AdminRoute>
          }
        />

        <Route
          path="/cadastro-funcionario"
          element={
            <AdminRoute>
              <CadastroFuncionario />
            </AdminRoute>
          }
        />

        <Route
          path="/editar-funcionario/:id"
          element={
            <AdminRoute>
              <CadastroFuncionario />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default AppRoutes

