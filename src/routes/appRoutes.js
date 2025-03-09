import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/home/home";
import Login from "../pages/login/login";
import CadastrarSenha from "../pages/login/criarSenha"; // 🔥 Nova Tela
import CadastroEmpresa from "../pages/empresa/cadastroEmpresa";
import CadastroUsuario from "../pages/funcionario/cadastroFuncionario";
import GerenciarEmpresa from "../pages/empresa/gerenciarEmpresa";
import GerenciarFuncionarios from "../pages/funcionario/gerenciarFuncionarios"; // 🔥 Nova Tela
import PedidoForm from "../pages/pedidos/pedidosForm";
import { supabase } from "../services/supabase";
import Cadastro from "../pages/login/cadastro";

// 🔒 Função para proteger rotas privadas (exige autenticação)
const PrivateRoute = ({ children }) => {
  const session = supabase.auth.getSession(); // 🔥 Ajuste: Verifica se há sessão ativa
  return session ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastrar-senha" element={<CadastrarSenha />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* 🔹 Rotas Privadas */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/cadastro-empresa" element={<PrivateRoute><CadastroEmpresa /></PrivateRoute>} />
        <Route path="/cadastro-usuario" element={<PrivateRoute><CadastroUsuario /></PrivateRoute>} />
        <Route path="/gerenciar-empresa" element={<PrivateRoute><GerenciarEmpresa /></PrivateRoute>} />
        <Route path="/gerenciar-funcionarios" element={<PrivateRoute><GerenciarFuncionarios /></PrivateRoute>} />
        <Route path="/novo-pedido" element={<PrivateRoute><PedidoForm /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
