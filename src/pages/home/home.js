import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Button, Container, Tabs, Tab } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./home.css";
import Header from "../../components/header/header";

function Home() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datasComPedidos, setDatasComPedidos] = useState([]);
  const [activeTab, setActiveTab] = useState("semana");
  const [empresa, setEmpresa] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarEmpresa = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userData.user.id)
        .single();

      if (usuario?.empresa_id) {
        const { data: empresaData } = await supabase
          .from("empresas")
          .select("nome")
          .eq("id", usuario.empresa_id)
          .single();
        setEmpresa(empresaData?.nome);

        // Salva no localStorage para facilitar requisições futuras
        localStorage.setItem("empresa_id", usuario.empresa_id);
        buscarPedidos(usuario.empresa_id);
      }
    };

    buscarEmpresa();
  }, []);

  const buscarPedidos = async (empresaId) => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("empresa_id", empresaId);

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
    } else {
      setPedidos(data);
      setDatasComPedidos(data.map((pedido) => pedido.data_entrega));
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setActiveTab("dia");
  };

  const pedidosDoDia = pedidos.filter((pedido) =>
    pedido.data_entrega === selectedDate?.toISOString().split("T")[0]
  );

  const marcarDatasNoCalendario = ({ date }) => {
    return datasComPedidos.includes(date.toISOString().split("T")[0])
      ? "has-pedido"
      : "";
  };

  return (
    <Container fluid className="p-0">
      {/* 🔥 Header separado */}
      <Header />

      {/* Nome da empresa cadastrada */}
      {empresa && (
        <div className="empresa-header">
          📌 Empresa: <strong>{empresa}</strong>
        </div>
      )}

      {/* Calendário */}
      <Container className="text-center mt-3">
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={marcarDatasNoCalendario}
          />
        </div>
      </Container>

      {/* Abas de pedidos */}
      <Container className="mt-3">
        <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-3">
          <Tab eventKey="semana" title="Pedidos da Semana">
            {pedidos.length > 0 ? (
              <ul className="list-group">
                {pedidos.map((pedido) => (
                  <li key={pedido.id} className="list-group-item">
                    <strong>{pedido.titulo}</strong> - {pedido.data_entrega}
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

      {/* Botão flutuante para criar pedido */}
      <Button className="btn-floating" variant="success" onClick={() => navigate("/novo-pedido")}>+</Button>
    </Container>
  );
}

export default Home;
