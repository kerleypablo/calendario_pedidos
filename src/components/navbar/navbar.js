import React, { useState, useEffect } from "react";
import { Navbar, Button, Offcanvas, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", userData.user.id)
        .single();

      if (usuario?.tipo === "admin") {
        setIsAdmin(true);
      }
    };

    verificarAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand={false} className="p-3">
        <Button variant="light" onClick={() => setShowMenu(true)}>☰</Button>
        <Navbar.Brand className="mx-auto">Agenda</Navbar.Brand>
        <Button variant="danger" onClick={handleLogout}>Sair</Button>
      </Navbar>

      {/* Menu Lateral */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link onClick={() => navigate("/perfil")}>Perfil</Nav.Link>
            
            {/* Apenas Admin pode acessar essas opções */}
            {isAdmin && (
              <>
                <Nav.Link onClick={() => navigate("/gerenciar-empresa")}>Gerenciar Empresa</Nav.Link>
                <Nav.Link onClick={() => navigate("/gerenciar-funcionarios")}>Gerenciar Funcionários</Nav.Link>
              </>
            )}

            <Nav.Link onClick={() => navigate("/configuracoes")}>Configurações</Nav.Link>
            <Nav.Link onClick={() => setShowMenu(false)}>Fechar</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default NavigationBar;
