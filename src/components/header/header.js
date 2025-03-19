import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Button, Navbar, Offcanvas, Nav } from "react-bootstrap";
import "./header.css";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("empresa_id");
    navigate("/");
  };

  return (
    <>
      {/* 🔹 Navbar superior */}
      <Navbar className="navbar">
        <Button onClick={() => setShowMenu(true)}>☰</Button>
        <Navbar.Brand className="mx-auto">Agenda</Navbar.Brand>
        <Button className="btn-danger" onClick={handleLogout}>Sair</Button>
      </Navbar>

      {/* 🔹 Menu Lateral */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link onClick={() => navigate("/home")}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate("/perfil")}>Perfil</Nav.Link>
            <Nav.Link onClick={() => navigate("/configuracoes")}>Configurações</Nav.Link>

            {/* 🔥 Links extras para administradores */}
            {userRole === "admin" && (
              <>
                <Nav.Link onClick={() => navigate("/gerenciar-empresa")}>
                  Gerenciar Empresa
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/cadastro-usuario")}>
                  Cadastrar Funcionário
                </Nav.Link>
              </>
            )}

            <Nav.Link onClick={() => setShowMenu(false)}>Fechar</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Header;
