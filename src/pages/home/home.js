import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { getMessaging, onMessage } from "firebase/messaging";
import { enviarNotificacao } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { Button, Container, Navbar, Offcanvas, Nav, Tabs, Tab } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./home.css";

function Home() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datasComPedidos, setDatasComPedidos] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("semana");
  const navigate = useNavigate();

  // Função para buscar pedidos do banco
  const buscarPedidos = async () => {
    const { data, error } = await supabase.from("pedidos").select("*");

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
    } else {
      setPedidos(data);

      // Pegar as datas dos pedidos para marcar no calendário
      const datas = data.map((pedido) => pedido.data_entrega);
      setDatasComPedidos(datas);
    }
  };

  useEffect(() => {
    buscarPedidos();

    // Escutar eventos do Supabase (WebSocket)
    const canal = supabase
      .channel("novo_pedido")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, (payload) => {
        console.log("📢 Novo pedido recebido:", payload.new);

        // Atualizar lista de pedidos
        setPedidos((prevPedidos) => [...prevPedidos, payload.new]);

        // Atualizar as datas no calendário
        setDatasComPedidos((prevDatas) => [...prevDatas, payload.new.data_entrega]);

        // Enviar notificação de novo pedido
        enviarNotificacao(payload.new.titulo, `Novo pedido de ${payload.new.cliente}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Marcar datas com pedidos no calendário
  const marcarDatasNoCalendario = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    return datasComPedidos.includes(formattedDate) ? "has-pedido" : "";
  };

  // Quando uma data for selecionada no calendário
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setActiveTab("dia");
  };

  // Filtrar pedidos da semana atual
  const hoje = new Date();
  const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay())); // Domingo
  const ultimoDiaSemana = new Date(hoje.setDate(primeiroDiaSemana.getDate() + 6)); // Sábado

  const pedidosDaSemana = pedidos.filter((pedido) => {
    const dataPedido = new Date(pedido.data_entrega);
    return dataPedido >= primeiroDiaSemana && dataPedido <= ultimoDiaSemana;
  });

  // Filtrar pedidos do dia selecionado
  const pedidosDoDia = pedidos.filter((pedido) => pedido.data_entrega === selectedDate?.toISOString().split("T")[0]);

  return (
    <Container fluid className="p-0">
      {/* Cabeçalho */}
      <Navbar bg="primary" variant="dark" expand={false} className="p-3">
        <Button variant="light" onClick={() => setShowMenu(true)}>☰</Button>
        <Navbar.Brand className="mx-auto">Agenda</Navbar.Brand>
        <Button variant="danger" onClick={() => navigate("/")}>Sair</Button>
      </Navbar>

      {/* Menu Lateral */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link href="#">Perfil</Nav.Link>
            <Nav.Link href="#">Configurações</Nav.Link>
            <Nav.Link onClick={() => setShowMenu(false)}>Fechar</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Calendário */}
      <Container className="text-center mt-3">
        <div className="calendar-wrapper">
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            tileClassName={marcarDatasNoCalendario}
          />
        </div>
      </Container>

      {/* Abas */}
      <Container className="mt-3">
        <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-3">
          <Tab eventKey="semana" title="Pedidos da Semana">
            {pedidosDaSemana.length > 0 ? (
              <ul className="list-group">
                {pedidosDaSemana.map((pedido) => (
                  <li key={pedido.id} className="list-group-item">
                    <strong>{pedido.titulo}</strong> - {pedido.data_entrega} ({pedido.hora_entrega})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-center">Nenhum pedido nesta semana.</p>
            )}
          </Tab>

          <Tab eventKey="dia" title="Pedidos do Dia">
            {selectedDate ? (
              pedidosDoDia.length > 0 ? (
                <ul className="list-group">
                  {pedidosDoDia.map((pedido) => (
                    <li key={pedido.id} className="list-group-item">
                      <strong>{pedido.titulo}</strong> - {pedido.hora_entrega}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-center">Nenhum pedido para esta data.</p>
              )
            ) : (
              <p className="text-muted text-center">Clique em um dia no calendário para ver os pedidos.</p>
            )}
          </Tab>
        </Tabs>
      </Container>

      {/* Botão Flutuante para Criar Novo Pedido */}
      <Button className="btn-floating" variant="success" onClick={() => navigate("/novo-pedido")}>
        +
      </Button>
    </Container>
  );
}

export default Home;
