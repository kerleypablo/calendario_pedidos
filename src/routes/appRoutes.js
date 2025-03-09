import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/login/login";
import Home from "../pages/home/home";
import PedidoForm from "../pages/pedidos/pedidosForm";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/novo-pedido" element={<PedidoForm />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
